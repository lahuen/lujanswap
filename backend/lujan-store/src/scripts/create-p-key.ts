// @ts-nocheck
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function seedStorefrontRequirements({ container }) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  logger.info("Checking storefront requirements...")

  try {
    // 1. Ensure Sales Channel
    const { data: channels } = await query.graph({
      entity: "sales_channel",
      fields: ["id", "name"],
    })

    let channelId = channels[0]?.id
    if (!channelId) {
      const scModule = container.resolve("sales_channel")
      const created = await scModule.create([{ name: "Default Sales Channel" }])
      channelId = Array.isArray(created) ? created[0].id : created.id
      logger.info("Default Sales Channel created.")
    }

    // 2. Ensure/Create Publishable Key
    const { data: keys } = await query.graph({
      entity: "api_key",
      fields: ["id", "token", "title"],
      filters: { title: "Storefront Key" }
    })

    if (keys.length === 0) {
      const { result } = await createApiKeysWorkflow(container).run({
        input: {
          api_keys: [{ title: "Storefront Key", type: "publishable", created_by: "system" }],
        },
      })
      const newKey = result[0]
      logger.info(`TOKEN CREATED: ${newKey.token}`)

      // Link to Sales Channel
      try {
        const remoteLink = container.resolve("remoteLink")
        await remoteLink.create([
          {
            api_key: { api_key_id: newKey.id },
            sales_channel: { sales_channel_id: channelId }
          }
        ])
        logger.info("Linked Key to Sales Channel.")
      } catch (e) {
        logger.warn("Could not link key to channel automatically.")
      }
    } else {
      logger.info(`TOKEN READY: ${keys[0].token}`)
    }

    // 3. Ensure Region
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
    console.log("   BACKEND READY: RE-DEPLOY VERCEL NOW   ")
    console.log("*****************************************")

  } catch (error) {
    logger.error(`Failed to seed requirements: ${error.message}`)
  }
}
