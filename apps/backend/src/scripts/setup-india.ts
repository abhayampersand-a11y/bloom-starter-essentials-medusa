import { MedusaContainer } from "@medusajs/framework";
import {
    ContainerRegistrationKeys,
    ModuleRegistrationName,
} from "@medusajs/framework/utils";
import {
    createRegionsWorkflow,
    createShippingOptionsWorkflow,
    createTaxRegionsWorkflow,
    deleteRegionsWorkflow,
    updateProductVariantsWorkflow,
    updateRegionsWorkflow,
    updateStockLocationsWorkflow,
    updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const USD_TO_INR = 90;

// Cash on Delivery, alongside the built-in manual provider.
const INDIA_PAYMENT_PROVIDERS = ["pp_system_default", "pp_cod_cod"];

const INDIA_SHIPPING_OPTIONS = [
    {
        name: "Standard Shipping (India)",
        amount: 0,
        type: {
            label: "Standard",
            description: "Ships across India in 3-5 business days",
            code: "standard-india",
        },
    },
    {
        name: "Express Shipping (India)",
        amount: 149,
        type: {
            label: "Express",
            description: "Ships across India in 1-2 business days",
            code: "express-india",
        },
    },
];

/**
 * Converts the seeded US/EU store into an India store:
 *  - INR as the default (tax-inclusive) store currency
 *  - "India" region (INR, country IN) with 18% GST tax region
 *  - "India" service zone + free standard and ₹149 express shipping options
 *  - Cash on Delivery and manual payment enabled on the region
 *  - INR prices on every product variant (from the USD price)
 *  - stock location moved to Mumbai, IN
 *  - non-India regions removed
 *
 * Run with: npx medusa exec ./src/scripts/setup-india.ts
 */
export default async function setupIndia({
    container,
}: {
    container: MedusaContainer;
}) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const storeModuleService = container.resolve(ModuleRegistrationName.STORE);
    const fulfillmentModuleService = container.resolve(
        ModuleRegistrationName.FULFILLMENT
    );

    // 1. Make INR a supported store currency (default, tax-inclusive like Indian MRP)
    logger.info("Adding INR as default store currency...");
    const [store] = await storeModuleService.listStores();
    await updateStoresWorkflow(container).run({
        input: {
            selector: { id: store.id },
            update: {
                supported_currencies: [
                    { currency_code: "inr", is_default: true, is_tax_inclusive: true },
                    { currency_code: "usd" },
                    { currency_code: "eur", is_tax_inclusive: true },
                    { currency_code: "gbp", is_tax_inclusive: true },
                    { currency_code: "dkk", is_tax_inclusive: true },
                ],
            },
        },
    });

    // 2. Create the India region
    const { data: existingRegions } = await query.graph({
        entity: "region",
        fields: ["id", "name"],
    });

    let indiaRegion = existingRegions.find((r) => r.name === "India");
    if (!indiaRegion) {
        logger.info("Creating India region...");
        const { result } = await createRegionsWorkflow(container).run({
            input: {
                regions: [
                    {
                        name: "India",
                        currency_code: "inr",
                        countries: ["in"],
                        payment_providers: INDIA_PAYMENT_PROVIDERS,
                        automatic_taxes: true,
                        is_tax_inclusive: true,
                    },
                ],
            },
        });
        indiaRegion = result[0];
    } else {
        logger.info("India region already exists, enabling COD on it...");
        await updateRegionsWorkflow(container).run({
            input: {
                selector: { id: indiaRegion.id },
                update: { payment_providers: INDIA_PAYMENT_PROVIDERS },
            },
        });
    }

    // 3. Tax region for India (18% GST)
    const { data: existingTaxRegions } = await query.graph({
        entity: "tax_region",
        fields: ["id", "country_code"],
    });

    if (!existingTaxRegions.some((t) => t.country_code === "in")) {
        logger.info("Creating India tax region (18% GST)...");
        await createTaxRegionsWorkflow(container).run({
            input: [
                {
                    country_code: "in",
                    provider_id: "tp_system",
                    default_tax_rate: {
                        rate: 18,
                        code: "IN18",
                        name: "India GST",
                        is_default: true,
                    },
                },
            ],
        });
    } else {
        logger.info("India tax region already exists, skipping...");
    }

    // 4. India service zone + free standard shipping option
    const [fulfillmentSet] = await fulfillmentModuleService.listFulfillmentSets(
        {},
        { relations: ["service_zones"] }
    );
    if (!fulfillmentSet) {
        throw new Error("No fulfillment set found — run the initial seed first.");
    }

    let indiaZone = fulfillmentSet.service_zones?.find(
        (z) => z.name === "India"
    );
    if (!indiaZone) {
        logger.info("Creating India service zone...");
        [indiaZone] = await fulfillmentModuleService.createServiceZones([
            {
                name: "India",
                fulfillment_set_id: fulfillmentSet.id,
                geo_zones: [{ type: "country", country_code: "in" }],
            },
        ]);
    } else {
        logger.info("India service zone already exists, skipping...");
    }

    const { data: existingShippingOptions } = await query.graph({
        entity: "shipping_option",
        fields: ["id", "name"],
    });

    const missingShippingOptions = INDIA_SHIPPING_OPTIONS.filter(
        (o) => !existingShippingOptions.some((existing) => existing.name === o.name)
    );

    if (missingShippingOptions.length) {
        logger.info(
            `Creating India shipping options: ${missingShippingOptions
                .map((o) => o.name)
                .join(", ")}...`
        );
        const shippingProfiles =
            await fulfillmentModuleService.listShippingProfiles({ type: "default" });
        await createShippingOptionsWorkflow(container).run({
            input: missingShippingOptions.map((option) => ({
                name: option.name,
                price_type: "flat" as const,
                provider_id: "manual_manual",
                service_zone_id: indiaZone!.id,
                shipping_profile_id: shippingProfiles[0].id,
                type: option.type,
                prices: [{ currency_code: "inr", amount: option.amount }],
                rules: [
                    { attribute: "enabled_in_store", value: "true", operator: "eq" },
                    { attribute: "is_return", value: "false", operator: "eq" },
                ],
            })),
        });
    } else {
        logger.info("India shipping options already exist, skipping...");
    }

    // 5. Add INR prices to every variant (converted from USD, rounded to X99)
    logger.info("Adding INR prices to product variants...");
    const { data: variants } = await query.graph({
        entity: "variant",
        fields: ["id", "prices.amount", "prices.currency_code"],
    });

    const variantsNeedingInr = variants.filter(
        (v) =>
            v.prices?.length &&
            !v.prices.some((p) => p?.currency_code === "inr")
    );

    const CHUNK = 25;
    for (let i = 0; i < variantsNeedingInr.length; i += CHUNK) {
        const chunk = variantsNeedingInr.slice(i, i + CHUNK);
        await updateProductVariantsWorkflow(container).run({
            input: {
                product_variants: chunk.map((v) => {
                    const usd = v.prices!.find((p) => p?.currency_code === "usd");
                    const base = Number(usd?.amount ?? v.prices![0]!.amount);
                    // e.g. $98 -> 8,899 INR (rounded up to the next hundred, minus 1)
                    const inrAmount = Math.ceil((base * USD_TO_INR) / 100) * 100 - 1;
                    return {
                        id: v.id,
                        prices: [
                            ...v.prices!.map((p) => ({
                                currency_code: p!.currency_code,
                                amount: Number(p!.amount),
                            })),
                            { currency_code: "inr", amount: inrAmount },
                        ],
                    };
                }),
            },
        });
    }
    logger.info(
        `Added INR prices to ${variantsNeedingInr.length} variants (of ${variants.length}).`
    );

    // 6. Move the stock location to India
    const { data: stockLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
    });
    if (stockLocations.length) {
        logger.info("Updating stock location address to Mumbai, IN...");
        await updateStockLocationsWorkflow(container).run({
            input: {
                selector: { id: stockLocations[0].id },
                update: {
                    name: "Mumbai Warehouse",
                    address: {
                        city: "Mumbai",
                        country_code: "IN",
                        address_1: "Plot 42, Andheri East",
                        postal_code: "400069",
                        province: "Maharashtra",
                    },
                },
            },
        });
    }

    // 7. Remove the non-India regions
    const regionsToDelete = existingRegions
        .filter((r) => r.name !== "India")
        .map((r) => r.id);
    if (regionsToDelete.length) {
        logger.info(`Deleting ${regionsToDelete.length} non-India regions...`);
        await deleteRegionsWorkflow(container).run({
            input: { ids: regionsToDelete },
        });
    }

    logger.info(
        "India setup complete. Region: India (INR, 18% GST), standard + express shipping, COD enabled."
    );
}
