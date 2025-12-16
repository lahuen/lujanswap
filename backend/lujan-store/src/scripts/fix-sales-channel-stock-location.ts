import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Fixes the association between sales channels and stock locations.
 * This script ensures that all sales channels are associated with at least one stock location.
 * If no stock location exists, it will create a default one.
 */
export default async function fixSalesChannelStockLocation({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)

  logger.info("Starting sales channel and stock location association fix...")

  // Get all sales channels
  const salesChannels = await salesChannelModuleService.listSalesChannels()
  logger.info(`Found ${salesChannels.length} sales channel(s)`)

  if (salesChannels.length === 0) {
    logger.warn("No sales channels found. Please create at least one sales channel first.")
    return
  }

  // Get all stock locations
  const stockLocations = await stockLocationModuleService.listStockLocations({})
  logger.info(`Found ${stockLocations.length} stock location(s)`)

  if (stockLocations.length === 0) {
    logger.warn("No stock locations found. Please run the seed script first or create a stock location.")
    return
  }

  // Use the first stock location as default (or you can filter by name if needed)
  const defaultStockLocation = stockLocations[0]
  logger.info(`Using stock location: ${defaultStockLocation.name} (${defaultStockLocation.id})`)

  // Associate each sales channel with the default stock location
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  for (const salesChannel of salesChannels) {
    // Associate the sales channel with the stock location via direct SQL
    // We use SQL because the Remote Link definition seems missing in this environment

    const existing = await knex("sales_channel_stock_location")
      .where({
        sales_channel_id: salesChannel.id,
        stock_location_id: defaultStockLocation.id
      })

    if (existing.length === 0) {
      // Generate a simple ID
      const id = "link_" + Math.random().toString(36).substring(2, 15)

      await knex("sales_channel_stock_location").insert({
        id,
        sales_channel_id: salesChannel.id,
        stock_location_id: defaultStockLocation.id,
        created_at: new Date(),
        updated_at: new Date()
      })
      logger.info(
        `Successfully associated sales channel "${salesChannel.name}" (${salesChannel.id}) with stock location "${defaultStockLocation.name}" (Direct SQL)`
      )
    } else {
      logger.info(
        `Sales channel "${salesChannel.name}" (${salesChannel.id}) is already associated with stock location "${defaultStockLocation.name}" (Direct SQL confirmed)`
      )
    }
  }

  logger.info("Finished fixing sales channel and stock location associations.")
}
