/**
 * Normalizes an Indian mobile number to E.164 (+91XXXXXXXXXX).
 *
 * The auth identity is keyed on the result, so "9876543210", "+91 98765 43210"
 * and "098765-43210" all have to resolve to the same account.
 *
 * Returns null if the input isn't a plausible Indian mobile number.
 */
export function normalizeIndianPhone(input: unknown): string | null {
    if (typeof input !== "string") {
        return null;
    }

    const digits = input.replace(/\D/g, "");

    // 10 digits, optionally prefixed with the 91 country code or a trunk 0.
    let local: string;
    if (digits.length === 10) {
        local = digits;
    } else if (digits.length === 11 && digits.startsWith("0")) {
        local = digits.slice(1);
    } else if (digits.length === 12 && digits.startsWith("91")) {
        local = digits.slice(2);
    } else {
        return null;
    }

    // Indian mobile numbers start with 6-9.
    if (!/^[6-9]\d{9}$/.test(local)) {
        return null;
    }

    return `+91${local}`;
}
