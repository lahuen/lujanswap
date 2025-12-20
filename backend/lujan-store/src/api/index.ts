import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = (req: MedusaRequest, res: MedusaResponse) => {
  res.json({
    message: "Lujan Marketplace API is running!",
    status: "healthy",
    documentation: "https://docs.medusajs.com"
  })
}
