import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function listLinks({ container }: ExecArgs) {
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  // This is a private property or internal state, accessing it might be tricky.
  // But let's try to see if we can perform a broad search or introspection.
  // Actually, RemoteLink doesn't expose list of definitions easily.

  // However, we can try to "guess" by checking if link.list works with certain keys.

  console.log("Attempting to list links between stock_location and sales_channel...")

  // Try stock_location_id
  try {
    const res = await link.list({
      stock_location: { stock_location_id: "test" },
      sales_channel: { sales_channel_id: "test" }
    })
    console.log("Keys stock_location_id + sales_channel_id: Valid keys (even if empty result)")
  } catch (e: any) {
    console.log("Keys stock_location_id + sales_channel_id: " + e.message)
  }

  // Try location_id
  try {
    const res = await link.list({
      stock_location: { location_id: "test" },
      sales_channel: { sales_channel_id: "test" }
    })
    console.log("Keys location_id + sales_channel_id: Valid keys (even if empty result)")
  } catch (e: any) {
    console.log("Keys location_id + sales_channel_id: " + e.message)
  }
}
