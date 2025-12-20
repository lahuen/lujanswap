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
    // 1. Ensure Sales Channel
    const { data: channels } = await query.graph({
      entity: "sales_channel",
      fields: ["id", "name"],
      filters: { name: "Default Sales Channel" }
    })

    let channelId = channels[0]?.id
    if (channels.length === 0) {
      const { result: newChannel } = await container.resolve("salesChannelModuleService").createSalesChannels([{ name: "Default Sales Channel" }])
      channelId = newChannel.id
      logger.info("Default Sales Channel created.")
    }

    // 2. Ensure/Create Publishable Key and link to Sales Channel
    const { data: keys } = await query.graph({
      entity: "api_key",
      fields: ["id", "token", "title"],
      filters: { title: "Storefront Key" }
    })

    let pkId = keys[0]?.id
    if (keys.length === 0) {
      const { result } = await createApiKeysWorkflow(container).run({
        input: {
          api_keys: [{ title: "Storefront Key", type: ApiKeyType.PUBLISHABLE, created_by: "system" }],
        },
      })
      const newKey = result[0]
      pkId = newKey.id
      logger.info(`TOKEN CREATED: ${newKey.token}`)

      // Link to Sales Channel
      await container.resolve("api_key_module_service").linkSalesChannels(newKey.id, [channelId])
      logger.info("Linked Key to Sales Channel.")
    }

    // 3. Ensure Region and link to Sales Channel
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
    }

    console.log("*****************************************")
    console.log("   STOREFRONT READY FOR DEPLOYMENT       ")
    console.log("*****************************************")

  } catch (error) {
    logger.error(`Failed to seed requirements: ${error.message}`)
  }
}
