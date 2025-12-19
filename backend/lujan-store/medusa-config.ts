import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    // @ts-ignore
    admin: process.env.DISABLE_ADMIN === 'true' ? { disable: true } : undefined,
    databaseUrl: process.env.DATABASE_URL,
    // Ensure SSL for both Medusa v1 and v2
    // @ts-ignore
    database_extra: process.env.NODE_ENV !== "development" ? { ssl: { rejectUnauthorized: false } } : undefined,
    databaseDriverOptions: process.env.NODE_ENV !== "development" ? {
      connection: {
        ssl: {
          rejectUnauthorized: false
        }
      }
    } : undefined,

    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: {
    [Modules.STOCK_LOCATION]: true,
    [Modules.SALES_CHANNEL]: true,
    ...(process.env.REDIS_URL ? {
      [Modules.CACHE]: {
        resolve: "@medusajs/medusa/cache-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
          redisOptions: {
            tls: { rejectUnauthorized: false }
          }
        },
      },
      [Modules.EVENT_BUS]: {
        resolve: "@medusajs/medusa/event-bus-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
          redisOptions: {
            tls: { rejectUnauthorized: false }
          }
        },
      },
    } : {}),
  }
})
