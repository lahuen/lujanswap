import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function testLink({ container }: ExecArgs) {
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  // Fake IDs for testing keys
  const stockLocationId = "sloc_TEST"
  const salesChannelId = "sc_TEST"

  console.log("Testing link creation with different keys...")

  // Case 1: stock_location_id, sales_channel_id
  try {
    await link.create([{
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
    }])
    console.log("Success: stock_location_id, sales_channel_id")
  } catch (e: any) {
    console.log("Fail 1: " + e.message)
  }

  // Case 2: stock_location_id, id
  try {
    await link.create([{
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
      [Modules.SALES_CHANNEL]: { id: salesChannelId },
    }])
    console.log("Success: stock_location_id, id")
  } catch (e: any) {
    console.log("Fail 2: " + e.message)
  }

  // Case 3: id, sales_channel_id
  try {
    await link.create([{
      [Modules.STOCK_LOCATION]: { id: stockLocationId },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
    }])
    console.log("Success: id, sales_channel_id")
  } catch (e: any) {
    console.log("Fail 3: " + e.message)
  }

  // Case 4: id, id
  try {
    await link.create([{
      [Modules.STOCK_LOCATION]: { id: stockLocationId },
      [Modules.SALES_CHANNEL]: { id: salesChannelId },
    }])
    console.log("Success: id, id")
  } catch (e: any) {
    console.log("Fail 4: " + e.message)
  }
}
