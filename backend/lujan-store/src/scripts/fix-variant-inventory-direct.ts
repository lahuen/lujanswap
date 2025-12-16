import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

/**
 * Creates inventory items for variants that don't have them using direct module access.
 */
export default async function fixVariantInventoryDirect({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService = container.resolve(Modules.INVENTORY)
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  logger.info("Starting variant inventory fix using direct module access...")

  // Get all stock locations
  const stockLocations = await stockLocationModuleService.listStockLocations({})
  if (stockLocations.length === 0) {
    logger.warn("No stock locations found.")
    return
  }

  const defaultStockLocation = stockLocations[0]
  logger.info(`Using stock location: ${defaultStockLocation.name} (${defaultStockLocation.id})`)

  // Query to find variants without inventory items
  const { data: allVariants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "title",
      "sku",
      "product.id",
      "product.title",
    ],
  })

  logger.info(`Found ${allVariants.length} total variants`)

  // Check which variants have inventory
  const { data: variantsWithInventory } = await query.graph({
    entity: "product_variant_inventory_item",
    fields: ["variant_id"],
  })

  const variantIdsWithInventory = new Set(
    variantsWithInventory.map((v: any) => v.variant_id)
  )

  const variantsWithoutInventory = allVariants.filter(
    (v: any) => !variantIdsWithInventory.has(v.id)
  )

  logger.info(`Found ${variantsWithoutInventory.length} variants without inventory`)

  let fixed = 0

  for (const variant of variantsWithoutInventory) {
    try {
      // Create inventory item
      const inventoryItem = await inventoryService.createInventoryItems({
        sku: variant.sku || undefined,
        title: variant.title || variant.product?.title || "Product",
        requires_shipping: true,
      })

      logger.info(`Created inventory item: ${inventoryItem.id} for variant ${variant.id}`)

      // Link inventory item to variant
      await link.create({
        [Modules.PRODUCT]: {
          variant_id: variant.id,
        },
        [Modules.INVENTORY]: {
          inventory_item_id: inventoryItem.id,
        },
      })

      logger.info(`Linked inventory item to variant: ${variant.id}`)

      // Create inventory level
      await inventoryService.createInventoryLevels({
        inventory_item_id: inventoryItem.id,
        location_id: defaultStockLocation.id,
        stocked_quantity: 100,
      })

      logger.info(`Created inventory level for variant ${variant.title || variant.id}`)
      fixed++
    } catch (error: any) {
      logger.error(
        `Failed to fix inventory for variant "${variant.title || variant.id}": ${error.message}`
      )
      logger.error(`Error stack: ${error.stack}`)
    }
  }

  logger.info(`Finished fixing variant inventory. Fixed: ${fixed}`)
}
