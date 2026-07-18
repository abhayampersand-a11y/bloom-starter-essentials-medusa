import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
    createProductCategoriesWorkflow,
    createProductTagsWorkflow,
    createProductTypesWorkflow,
    updateCollectionsWorkflow,
    updateProductCategoriesWorkflow,
    updateProductTagsWorkflow,
    updateProductTypesWorkflow,
    updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";

/** Top-level gender categories added on top of the seeded Tops/Bottoms tree. */
const GENDER_CATEGORIES = [
    {
        name: "Men",
        handle: "men",
        description:
            "Menswear essentials — engineered fits and premium fabrics for training and everything after.",
    },
    {
        name: "Women",
        handle: "women",
        description:
            "Womenswear essentials — supportive, sculpting layers made to move with you.",
    },
];

/** Garment type for every seeded product, keyed by product handle. */
const TYPE_BY_HANDLE: Record<string, string> = {
    "crewneck-sweatshirt": "Sweatshirt",
    "relaxed-jogger-pant": "Joggers",
    "ribbed-long-sleeve-top": "Long Sleeve",
    "minimal-tee": "T-Shirt",
    "lightweight-training-short": "Shorts",
    "ribbed-sports-bra": "Sports Bra",
    "performance-legging": "Leggings",
    "studio-zip-jacket": "Jacket",
    "movement-windbreaker": "Windbreaker",
    "travel-hoodie": "Hoodie",
    "quilted-recovery-vest": "Vest",
    "warm-up-overshirt": "Overshirt",
};

/** Marketing tags for every seeded product, keyed by product handle. */
const TAGS_BY_HANDLE: Record<string, string[]> = {
    "crewneck-sweatshirt": ["Essential", "Bestseller", "Unisex"],
    "relaxed-jogger-pant": ["Essential", "Unisex"],
    "ribbed-long-sleeve-top": ["Essential", "New Arrival"],
    "minimal-tee": ["Essential", "Bestseller", "Unisex"],
    "lightweight-training-short": ["Training"],
    "ribbed-sports-bra": ["Training", "Bestseller"],
    "performance-legging": ["Training", "Bestseller"],
    "studio-zip-jacket": ["Outerwear", "Training"],
    "movement-windbreaker": ["Outerwear", "New Arrival"],
    "travel-hoodie": ["Outerwear", "Essential", "Unisex"],
    "quilted-recovery-vest": ["Outerwear", "New Arrival"],
    "warm-up-overshirt": ["Outerwear", "Essential"],
};

/** Products cut for women only; everything else is unisex (Men + Women). */
const WOMEN_ONLY_HANDLES = ["ribbed-sports-bra", "performance-legging"];

/**
 * Organizes the seeded catalog:
 *  - "Men" and "Women" top-level categories, every product assigned by gender
 *    (unisex products land in both)
 *  - a product type per product (T-Shirt, Hoodie, Leggings, ...)
 *  - marketing tags per product (Essential, Bestseller, Training, ...)
 *  - a display image (metadata.image_url) on every category, collection, tag
 *    and type that doesn't have one yet, taken from the first product filed
 *    under it — replace them any time in the admin via the Display Image widget.
 *
 * Idempotent. Run with: npx medusa exec ./src/scripts/setup-catalog.ts
 */
export default async function setupCatalog({
    container,
}: {
    container: MedusaContainer;
}) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    // 1. Men / Women categories
    const { data: existingCategories } = await query.graph({
        entity: "product_category",
        fields: ["id", "name", "handle", "metadata"],
    });

    const missingGenders = GENDER_CATEGORIES.filter(
        (g) => !existingCategories.some((c) => c.handle === g.handle)
    );
    if (missingGenders.length) {
        logger.info(
            `Creating gender categories: ${missingGenders.map((g) => g.name).join(", ")}...`
        );
        await createProductCategoriesWorkflow(container).run({
            input: {
                product_categories: missingGenders.map((g) => ({
                    ...g,
                    is_active: true,
                })),
            },
        });
    } else {
        logger.info("Gender categories already exist, skipping creation...");
    }

    const { data: allCategories } = await query.graph({
        entity: "product_category",
        fields: ["id", "name", "handle", "metadata"],
    });
    const categoryByHandle = new Map(allCategories.map((c) => [c.handle, c]));
    const menId = categoryByHandle.get("men")!.id;
    const womenId = categoryByHandle.get("women")!.id;

    // 2. Product tags
    const { data: existingTags } = await query.graph({
        entity: "product_tag",
        fields: ["id", "value", "metadata"],
    });
    const wantedTagValues = [...new Set(Object.values(TAGS_BY_HANDLE).flat())];
    const missingTagValues = wantedTagValues.filter(
        (value) => !existingTags.some((t) => t.value === value)
    );
    if (missingTagValues.length) {
        logger.info(`Creating product tags: ${missingTagValues.join(", ")}...`);
        await createProductTagsWorkflow(container).run({
            input: { product_tags: missingTagValues.map((value) => ({ value })) },
        });
    } else {
        logger.info("Product tags already exist, skipping creation...");
    }

    // 3. Product types
    const { data: existingTypes } = await query.graph({
        entity: "product_type",
        fields: ["id", "value", "metadata"],
    });
    const wantedTypeValues = [...new Set(Object.values(TYPE_BY_HANDLE))];
    const missingTypeValues = wantedTypeValues.filter(
        (value) => !existingTypes.some((t) => t.value === value)
    );
    if (missingTypeValues.length) {
        logger.info(`Creating product types: ${missingTypeValues.join(", ")}...`);
        await createProductTypesWorkflow(container).run({
            input: { product_types: missingTypeValues.map((value) => ({ value })) },
        });
    } else {
        logger.info("Product types already exist, skipping creation...");
    }

    const { data: allTags } = await query.graph({
        entity: "product_tag",
        fields: ["id", "value", "metadata"],
    });
    const { data: allTypes } = await query.graph({
        entity: "product_type",
        fields: ["id", "value", "metadata"],
    });
    const tagByValue = new Map(allTags.map((t) => [t.value, t]));
    const typeByValue = new Map(allTypes.map((t) => [t.value, t]));

    // 4. Assign gender categories, tags and a type to every product
    const { data: products } = await query.graph({
        entity: "product",
        fields: [
            "id",
            "handle",
            "thumbnail",
            "type_id",
            "categories.id",
            "tags.id",
            "collection.id",
        ],
    });

    const updates = products.flatMap((product) => {
        const currentCategoryIds = (product.categories ?? [])
            .map((c) => c?.id)
            .filter((id): id is string => Boolean(id));
        const currentTagIds = (product.tags ?? [])
            .map((t) => t?.id)
            .filter((id): id is string => Boolean(id));

        const genderIds = WOMEN_ONLY_HANDLES.includes(product.handle)
            ? [womenId]
            : [menId, womenId];

        const wantedTagIds = (TAGS_BY_HANDLE[product.handle] ?? [])
            .map((value) => tagByValue.get(value)?.id)
            .filter((id): id is string => Boolean(id));

        const typeValue = TYPE_BY_HANDLE[product.handle];
        const typeId = typeValue ? typeByValue.get(typeValue)?.id : undefined;

        const categoryIds = [...new Set([...currentCategoryIds, ...genderIds])];
        const tagIds = [...new Set([...currentTagIds, ...wantedTagIds])];

        const categoriesChanged =
            categoryIds.length !== currentCategoryIds.length;
        const tagsChanged = tagIds.length !== currentTagIds.length;
        const typeChanged = Boolean(typeId) && product.type_id !== typeId;

        if (!categoriesChanged && !tagsChanged && !typeChanged) {
            return [];
        }

        return [
            {
                id: product.id,
                category_ids: categoryIds,
                tag_ids: tagIds,
                ...(typeId ? { type_id: typeId } : {}),
            },
        ];
    });

    if (updates.length) {
        logger.info(`Organizing ${updates.length} products (gender/tags/type)...`);
        await updateProductsWorkflow(container).run({
            input: { products: updates },
        });
    } else {
        logger.info("All products already organized, skipping...");
    }

    // 5. Give every category, collection, tag and type a display image
    //    (first product thumbnail found under it) unless one is already set.
    const { data: organizedProducts } = await query.graph({
        entity: "product",
        fields: [
            "id",
            "handle",
            "thumbnail",
            "type_id",
            "categories.id",
            "tags.id",
            "collection.id",
        ],
    });

    const firstThumbnailWhere = (
        predicate: (p: (typeof organizedProducts)[number]) => boolean
    ) => organizedProducts.find((p) => p.thumbnail && predicate(p))?.thumbnail;

    const hasImage = (metadata: Record<string, unknown> | null | undefined) =>
        typeof metadata?.image_url === "string" && metadata.image_url.length > 0;

    // Categories — a parent with no direct products borrows from its children.
    const { data: refreshedCategories } = await query.graph({
        entity: "product_category",
        fields: ["id", "name", "handle", "metadata", "parent_category_id"],
    });
    for (const category of refreshedCategories) {
        if (hasImage(category.metadata)) continue;
        const childIds = refreshedCategories
            .filter((c) => c.parent_category_id === category.id)
            .map((c) => c.id);
        const memberIds = [category.id, ...childIds];
        const thumbnail = firstThumbnailWhere((p) =>
            (p.categories ?? []).some((c) => c && memberIds.includes(c.id))
        );
        if (!thumbnail) continue;
        logger.info(`Setting display image on category "${category.name}"...`);
        await updateProductCategoriesWorkflow(container).run({
            input: {
                selector: { id: category.id },
                update: {
                    metadata: { ...(category.metadata ?? {}), image_url: thumbnail },
                },
            },
        });
    }

    // Collections
    const { data: collections } = await query.graph({
        entity: "product_collection",
        fields: ["id", "title", "handle", "metadata"],
    });
    for (const collection of collections) {
        if (hasImage(collection.metadata)) continue;
        const thumbnail = firstThumbnailWhere(
            (p) => p.collection?.id === collection.id
        );
        if (!thumbnail) continue;
        logger.info(`Setting display image on collection "${collection.title}"...`);
        await updateCollectionsWorkflow(container).run({
            input: {
                selector: { id: collection.id },
                update: {
                    metadata: { ...(collection.metadata ?? {}), image_url: thumbnail },
                },
            },
        });
    }

    // Tags
    for (const tag of allTags) {
        if (hasImage(tag.metadata)) continue;
        const thumbnail = firstThumbnailWhere((p) =>
            (p.tags ?? []).some((t) => t?.id === tag.id)
        );
        if (!thumbnail) continue;
        logger.info(`Setting display image on tag "${tag.value}"...`);
        await updateProductTagsWorkflow(container).run({
            input: {
                selector: { id: tag.id },
                update: { metadata: { ...(tag.metadata ?? {}), image_url: thumbnail } },
            },
        });
    }

    // Types
    for (const type of allTypes) {
        if (hasImage(type.metadata)) continue;
        const thumbnail = firstThumbnailWhere((p) => p.type_id === type.id);
        if (!thumbnail) continue;
        logger.info(`Setting display image on type "${type.value}"...`);
        await updateProductTypesWorkflow(container).run({
            input: {
                selector: { id: type.id },
                update: { metadata: { ...(type.metadata ?? {}), image_url: thumbnail } },
            },
        });
    }

    logger.info(
        "Catalog setup complete: Men/Women categories, tags, types and display images are in place."
    );
}
