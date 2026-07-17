import { AbstractAuthModuleProvider, MedusaError } from "@medusajs/framework/utils";
import {
    AuthenticationInput,
    AuthenticationResponse,
    AuthIdentityProviderService,
    Logger,
} from "@medusajs/framework/types";
import crypto from "crypto";
import { normalizeIndianPhone } from "./phone";

type Options = {
    /** How long a code stays valid. Defaults to 5 minutes. */
    ttlSeconds?: number;
    /** Minimum gap between two sends to the same number. Defaults to 60 seconds. */
    resendCooldownSeconds?: number;
    /** Wrong guesses allowed before the code is burned. Defaults to 5. */
    maxAttempts?: number;
};

type OtpMetadata = {
    otp_salt?: string;
    otp_hash?: string;
    otp_expires_at?: number;
    otp_attempts?: number;
    otp_last_sent_at?: number;
    email?: string;
};

const DEFAULTS = {
    ttlSeconds: 5 * 60,
    resendCooldownSeconds: 60,
    maxAttempts: 5,
};

const hashOtp = (otp: string, salt: string) =>
    crypto.createHash("sha256").update(`${salt}:${otp}`).digest("hex");

/**
 * Phone + OTP authentication.
 *
 * The auth identity's `entity_id` is the normalized phone number. Codes are stored
 * hashed in `provider_metadata` and burned on first successful use.
 *
 * Two-step by design:
 *  - `update()` issues and "sends" a code. It's reached through the custom
 *    `/store/otp/send` route, which deliberately does not hand back a token.
 *  - `authenticate()` verifies the code and is what mints the session token.
 *
 * `register()` is disabled on purpose: Medusa's `/auth/customer/otp/register`
 * route issues a token for any successful response, which would let a caller skip
 * the code entirely.
 */
class OtpAuthService extends AbstractAuthModuleProvider {
    static identifier = "otp";
    static DISPLAY_NAME = "Phone OTP Authentication";

    protected readonly logger_: Logger;
    protected readonly options_: Required<Options>;

    constructor({ logger }: { logger: Logger }, options: Options = {}) {
        // @ts-ignore — the abstract constructor is untyped, matching the built-in providers.
        super(...arguments);

        this.logger_ = logger;
        this.options_ = { ...DEFAULTS, ...options };
    }

    /**
     * Issues a code for a phone number, creating a claimable auth identity on first use.
     */
    async update(
        data: Record<string, unknown>,
        authIdentityService: AuthIdentityProviderService
    ): Promise<AuthenticationResponse> {
        const phone = normalizeIndianPhone(data?.phone);
        if (!phone) {
            return { success: false, error: "Enter a valid 10-digit Indian mobile number" };
        }

        const email = typeof data?.email === "string" ? data.email.trim() : undefined;

        let existing: OtpMetadata | undefined;
        try {
            existing = await this.getProviderMetadata_(phone, authIdentityService);
        } catch (error: any) {
            if (error.type !== MedusaError.Types.NOT_FOUND) {
                return { success: false, error: error.message };
            }
        }

        const now = Date.now();
        const lastSentAt = existing?.otp_last_sent_at ?? 0;
        const cooldownMs = this.options_.resendCooldownSeconds * 1000;
        if (now - lastSentAt < cooldownMs) {
            const retryIn = Math.ceil((cooldownMs - (now - lastSentAt)) / 1000);
            return {
                success: false,
                error: `Please wait ${retryIn}s before requesting another code`,
            };
        }

        const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
        const salt = crypto.randomBytes(16).toString("hex");

        const metadata: OtpMetadata = {
            ...existing,
            otp_salt: salt,
            otp_hash: hashOtp(otp, salt),
            otp_expires_at: now + this.options_.ttlSeconds * 1000,
            otp_attempts: 0,
            otp_last_sent_at: now,
            // Kept so the storefront can prefill the customer record after verifying.
            email: email || existing?.email,
        };

        try {
            const authIdentity = existing
                ? await authIdentityService.update(phone, { provider_metadata: metadata })
                : await authIdentityService.create({
                      entity_id: phone,
                      provider_metadata: metadata,
                  });

            await this.deliver_(phone, otp);

            return { success: true, authIdentity: this.sanitize_(authIdentity), otp } as
                AuthenticationResponse & { otp: string };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async authenticate(
        userData: AuthenticationInput,
        authIdentityService: AuthIdentityProviderService
    ): Promise<AuthenticationResponse> {
        const phone = normalizeIndianPhone(userData.body?.phone);
        const otp = userData.body?.otp;

        if (!phone) {
            return { success: false, error: "Enter a valid 10-digit Indian mobile number" };
        }
        if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
            return { success: false, error: "Enter the 6-digit code" };
        }

        let authIdentity: any;
        try {
            authIdentity = await authIdentityService.retrieve({ entity_id: phone });
        } catch (error: any) {
            if (error.type === MedusaError.Types.NOT_FOUND) {
                return { success: false, error: "Invalid or expired code" };
            }
            return { success: false, error: error.message };
        }

        const metadata: OtpMetadata =
            this.getProviderIdentity_(authIdentity)?.provider_metadata ?? {};

        if (!metadata.otp_hash || !metadata.otp_salt || !metadata.otp_expires_at) {
            return { success: false, error: "Request a code first" };
        }

        if (Date.now() > metadata.otp_expires_at) {
            await this.clearOtp_(phone, metadata, authIdentityService);
            return { success: false, error: "Code expired, request a new one" };
        }

        const attempts = (metadata.otp_attempts ?? 0) + 1;
        if (attempts > this.options_.maxAttempts) {
            await this.clearOtp_(phone, metadata, authIdentityService);
            return { success: false, error: "Too many attempts, request a new code" };
        }

        const candidate = Buffer.from(hashOtp(otp, metadata.otp_salt));
        const expected = Buffer.from(metadata.otp_hash);
        const matches =
            candidate.length === expected.length &&
            crypto.timingSafeEqual(candidate, expected);

        if (!matches) {
            await authIdentityService.update(phone, {
                provider_metadata: { ...metadata, otp_attempts: attempts },
            });
            return { success: false, error: "Invalid or expired code" };
        }

        // Burn the code so it can't be replayed.
        const updated = await this.clearOtp_(phone, metadata, authIdentityService);
        return { success: true, authIdentity: this.sanitize_(updated) };
    }

    /**
     * Disabled: Medusa's register route mints a token for any success, which would
     * bypass the code. Codes are issued via `/store/otp/send` instead.
     */
    async register(): Promise<AuthenticationResponse> {
        return {
            success: false,
            error: "Request a code via /store/otp/send, then authenticate with it",
        };
    }

    /**
     * Dev-mode delivery: the code goes to the server log. Swap this for an SMS
     * gateway call (MSG91, Twilio) without touching the rest of the flow.
     */
    private async deliver_(phone: string, otp: string): Promise<void> {
        this.logger_.info(`[OTP] Code for ${phone}: ${otp}`);
    }

    private async clearOtp_(
        phone: string,
        metadata: OtpMetadata,
        authIdentityService: AuthIdentityProviderService
    ) {
        const { email, otp_last_sent_at } = metadata;
        return await authIdentityService.update(phone, {
            provider_metadata: {
                email,
                otp_last_sent_at,
                otp_salt: null,
                otp_hash: null,
                otp_expires_at: null,
                otp_attempts: null,
            },
        });
    }

    private async getProviderMetadata_(
        entityId: string,
        authIdentityService: AuthIdentityProviderService
    ): Promise<OtpMetadata> {
        const authIdentity = await authIdentityService.retrieve({ entity_id: entityId });
        return { ...(this.getProviderIdentity_(authIdentity)?.provider_metadata ?? {}) };
    }

    private getProviderIdentity_(authIdentity: any) {
        return authIdentity?.provider_identities?.find(
            (pi: any) => pi.provider === this.provider
        );
    }

    private sanitize_(authIdentity: any) {
        const copy = JSON.parse(JSON.stringify(authIdentity));
        const providerIdentity = this.getProviderIdentity_(copy);
        if (providerIdentity?.provider_metadata) {
            delete providerIdentity.provider_metadata.otp_hash;
            delete providerIdentity.provider_metadata.otp_salt;
        }
        return copy;
    }
}

export default OtpAuthService;
