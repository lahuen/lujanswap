import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function listTables({ container }: ExecArgs) {
  // Try to resolve generic pg connection
  try {
    const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const res = await knex.raw("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sales_channel_stock_location'")
    console.log("Columns for sales_channel_stock_location:")
    res.rows.forEach(r => console.log(r.column_name))
  } catch (e: any) {
    console.log("Could not list tables: " + e.message)
  }
}
