import {
    AbstractPaymentProvider,
    PaymentActions,
    PaymentSessionStatus,
} from "@medusajs/framework/utils";
import {
    AuthorizePaymentInput,
    AuthorizePaymentOutput,
    CancelPaymentInput,
    CancelPaymentOutput,
    CapturePaymentInput,
    CapturePaymentOutput,
    DeletePaymentInput,
    DeletePaymentOutput,
    GetPaymentStatusInput,
    GetPaymentStatusOutput,
    InitiatePaymentInput,
    InitiatePaymentOutput,
    ProviderWebhookPayload,
    RefundPaymentInput,
    RefundPaymentOutput,
    RetrievePaymentInput,
    RetrievePaymentOutput,
    UpdatePaymentInput,
    UpdatePaymentOutput,
    WebhookActionResult,
} from "@medusajs/framework/types";
import crypto from "crypto";

/**
 * Cash on Delivery.
 *
 * No money moves online: the session is authorized straight away so the order can
 * be placed, and the admin captures the payment once the courier collects cash.
 */
class CodPaymentProviderService extends AbstractPaymentProvider {
    static identifier = "cod";

    // AbstractPaymentProvider's constructor is protected; the provider loader
    // instantiates the class, so it has to be public here.
    constructor(container: Record<string, unknown>, options: Record<string, unknown>) {
        super(container, options);
    }

    async initiatePayment(
        _input: InitiatePaymentInput
    ): Promise<InitiatePaymentOutput> {
        return { id: crypto.randomUUID(), data: { collected: false } };
    }

    async authorizePayment(
        _input: AuthorizePaymentInput
    ): Promise<AuthorizePaymentOutput> {
        return { data: { collected: false }, status: PaymentSessionStatus.AUTHORIZED };
    }

    async capturePayment(
        input: CapturePaymentInput
    ): Promise<CapturePaymentOutput> {
        return { data: { ...input.data, collected: true } };
    }

    async getPaymentStatus(
        _input: GetPaymentStatusInput
    ): Promise<GetPaymentStatusOutput> {
        return { status: PaymentSessionStatus.AUTHORIZED };
    }

    async retrievePayment(
        input: RetrievePaymentInput
    ): Promise<RetrievePaymentOutput> {
        return input.data ?? {};
    }

    async updatePayment(
        input: UpdatePaymentInput
    ): Promise<UpdatePaymentOutput> {
        return { data: input.data ?? {} };
    }

    async deletePayment(
        _input: DeletePaymentInput
    ): Promise<DeletePaymentOutput> {
        return { data: {} };
    }

    async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
        return { data: input.data ?? {} };
    }

    async cancelPayment(_input: CancelPaymentInput): Promise<CancelPaymentOutput> {
        return { data: {} };
    }

    async getWebhookActionAndData(
        _payload: ProviderWebhookPayload["payload"]
    ): Promise<WebhookActionResult> {
        return { action: PaymentActions.NOT_SUPPORTED };
    }
}

export default CodPaymentProviderService;
