import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260716180451 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "review" ("id" text not null, "product_id" text not null, "customer_id" text null, "name" text not null, "email" text null, "rating" integer not null, "title" text null, "content" text not null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "source" text check ("source" in ('storefront', 'admin')) not null default 'storefront', "moderation_note" text null, "moderated_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_product_id_status" ON "review" ("product_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_status" ON "review" ("status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "review_image" ("id" text not null, "url" text not null, "file_id" text null, "review_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_image_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_image_review_id" ON "review_image" ("review_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_image_deleted_at" ON "review_image" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "review_image" add constraint "review_image_review_id_foreign" foreign key ("review_id") references "review" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "review_image" drop constraint if exists "review_image_review_id_foreign";`);

    this.addSql(`drop table if exists "review" cascade;`);

    this.addSql(`drop table if exists "review_image" cascade;`);
  }

}
