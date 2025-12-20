import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ExecArgs } from "@medusajs/framework/types"
import { ApiKeyType } from "@medusajs/framework/utils"

export default async function seedStorefrontRequirements({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  logger.info("Checking storefront requirements...")

  try {
    // 1. Ensure/Create Publishable Key
    const { data: keys } = await query.graph({
      entity: "api_key",
      fields: ["token", "title"],
      filters: { title: "Storefront Key" }
    })

    if (keys.length === 0) {
      const { result } = await createApiKeysWorkflow(container).run({
        input: {
          api_keys: [{ title: "Storefront Key", type: ApiKeyType.PUBLISHABLE, created_by: "system" }],
        },
      })
      logger.info(`TOKEN CREATED: ${result[0].token}`)
    } else {
      logger.info(`TOKEN EXISTS: ${keys[0].token}`)
    }

    // 2. Ensure/Create default Region (Argentina)
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "name"]
    })

    if (regions.length === 0) {
      await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Argentina",
              currency_code: "ars",
              countries: ["ar"],
              payment_providers: ["pp_system_default"]
            }
          ]
        },
      })
      logger.info("Default Region (Argentina) created.")
    } else {
      logger.info("Region already exists.")
    }

    console.log("*****************************************")
    console.log("   STOREFRONT READY FOR DEPLOYMENT       ")
    console.log("*****************************************")

  } catch (error) {
    logger.error(`Failed to seed requirements: ${error.message}`)
  }
}
