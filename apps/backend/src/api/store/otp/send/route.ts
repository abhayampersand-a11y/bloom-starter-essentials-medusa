import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { IAuthModuleService } from "@medusajs/framework/types";
import { normalizeIndianPhone } from "../../../../modules/otp-auth/phone";

type SendOtpBody = {
    phone?: string;
    email?: string;
};

/**
 * Issues a login code for a phone number.
 *
 * Deliberately separate from `/auth/customer/otp`: that route mints a session token
 * for any successful provider response, so issuing the code has to happen somewhere
 * that hands back nothing but an acknowledgement.
 */
export const POST = async (
    req: MedusaRequest<SendOtpBody>,
    res: MedusaResponse
): Promise<void> => {
    const { phone, email } = req.body ?? {};

    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
        res.status(400).json({
            message: "Enter a valid 10-digit Indian mobile number",
        });
        return;
    }

    if (email !== undefined && (typeof email !== "string" || !email.includes("@"))) {
        res.status(400).json({ message: "Enter a valid email address" });
        return;
    }

    const authService: IAuthModuleService = req.scope.resolve(Modules.AUTH);

    const result = await authService.updateProvider("otp", {
        phone: normalized,
        email,
    });

    if (!result.success) {
        // Cooldown and validation failures are the caller's fault, not a server error.
        res.status(429).json({ message: result.error });
        return;
    }

    const body: Record<string, unknown> = { success: true, phone: normalized };

    // Dev convenience only: the code is always in the server log, but surfacing it
    // in the response saves digging through logs while there's no SMS gateway.
    if (process.env.NODE_ENV === "development") {
        body.dev_otp = (result as { otp?: string }).otp;
    }

    res.json(body);
};
