import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { IAuthModuleService } from "@medusajs/framework/types";

/**
 * Returns the email a third-party provider (Google) knows for the caller's auth
 * identity.
 *
 * `createCustomerAccountWorkflow` only ever uses the `customerData` it's handed —
 * it never reads the identity's `user_metadata` — so a first-time social login has
 * no other way to learn the customer's email, and would otherwise create an
 * account with a null one.
 */
export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
): Promise<void> => {
    const authIdentityId = req.auth_context?.auth_identity_id;

    if (!authIdentityId) {
        res.status(401).json({ message: "Not authenticated" });
        return;
    }

    const authService: IAuthModuleService = req.scope.resolve(Modules.AUTH);
    const authIdentity = await authService.retrieveAuthIdentity(authIdentityId);

    const identities = authIdentity.provider_identities ?? [];
    const email = identities
        .map((identity) => {
            const metadata = (identity.user_metadata ?? {}) as Record<string, unknown>;
            return typeof metadata.email === "string" ? metadata.email : undefined;
        })
        .find(Boolean);

    res.json({ email: email ?? null });
};
