import {
  createApiKeysWorkflow,
} from "@medusajs/medusa/core-flows"
import { ExecArgs } from "@medusajs/framework/types"
import { ApiKeyType } from "@medusajs/framework/utils"

export default async function createPublishableKey({ container }: ExecArgs) {
  const logger = container.resolve("logger")

  logger.info("Starting publishable key creation workflow...")

  try {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Storefront Key",
            type: ApiKeyType.PUBLISHABLE,
            created_by: "system"
          },
        ],
      },
    })

    const key = result[0]
    console.log("--- KEY_START ---")
    console.log(`TITLE: ${key.title}`)
    console.log(`TOKEN: ${key.token}`)
    console.log("--- KEY_END ---")

    logger.info("Publishable key created successfully.")
  } catch (error) {
    logger.error(`Failed to create publishable key: ${error.message}`)
  }
}
