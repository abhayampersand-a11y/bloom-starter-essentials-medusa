import { defineConfig, loadEnv } from "@medusajs/framework/utils";
import path from "path";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

// Object storage is only configured in deployed environments. Without it the S3
// provider fails every upload ("Region is missing"), so local development falls
// back to storing files on disk under `static/`, which Medusa serves at
// `/static` out of the box.
const hasObjectStorage = Boolean(
  process.env.R2_FILE_URL || process.env.S3_BUCKET || process.env.S3_FILE_URL
);
const uploadsDir = path.join(process.cwd(), "static");

const s3FileProvider = {
  id: "s3",
  resolve: "@medusajs/medusa/file-s3",
  is_default: true,
  options: process.env.R2_FILE_URL
    ? {
        file_url: process.env.R2_FILE_URL,
        prefix: process.env.R2_PREFIX,
        bucket: process.env.R2_BUCKET,
        endpoint: process.env.R2_ENDPOINT,
        access_key_id: process.env.R2_ACCESS_KEY_ID,
        secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
        session_token: process.env.R2_SESSION_TOKEN,
        region: "auto",
        additional_client_config: {
          forcePathStyle: false,
          requestChecksumCalculation: "WHEN_REQUIRED",
        },
      }
    : {
        authentication_method: "s3-iam-role",
        file_url: process.env.S3_FILE_URL,
        prefix: process.env.S3_PREFIX,
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
      },
};

const localFileProvider = {
  id: "local",
  resolve: "@medusajs/medusa/file-local",
  is_default: true,
  options: {
    upload_dir: uploadsDir,
    private_upload_dir: uploadsDir,
    backend_url: `${
      process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    }/static`,
  },
};

module.exports = defineConfig({
  admin: {
    vite: () => {
      let hmrServer;
      if (process.env.HMR_BIND_HOST) {
        const { createServer } = require("http");
        hmrServer = createServer();
        const hmrPort = parseInt(process.env.HMR_PORT || "9001");
        hmrServer.listen(hmrPort, process.env.HMR_BIND_HOST);
      }

      let allowedHosts;
      if (process.env.__MEDUSA_ADDITIONAL_ALLOWED_HOSTS) {
        allowedHosts = [process.env.__MEDUSA_ADDITIONAL_ALLOWED_HOSTS];
      }

      return {
        server: {
          allowedHosts,
          hmr: {
            server: hmrServer,
          },
        },
      };
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,

    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    {
      resolve: "./src/modules/product-review",
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [hasObjectStorage ? s3FileProvider : localFileProvider],
      },
    },
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          {
            resolve: "./src/modules/otp-auth",
            id: "otp",
          },
          // Only registered once credentials exist — the provider throws on boot without them.
          ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                {
                  resolve: "@medusajs/medusa/auth-google",
                  id: "google",
                  options: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
                  },
                },
              ]
            : []),
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/cod-payment",
            id: "cod",
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: { url: process.env.REDIS_URL },
      },
    },
  ],
});
