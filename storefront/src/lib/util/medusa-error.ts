/**
 * Handles Medusa API errors and extracts meaningful error messages.
 * @param error - The error object from the API call
 * @throws Error with a user-friendly message
 */
export default function medusaError(error: any): never {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const u = new URL(error.config.url, error.config.baseURL)
    console.error("Resource:", u.toString())
    console.error("Response data:", error.response.data)
    console.error("Status code:", error.response.status)
    console.error("Headers:", error.response.headers)

    // Extracting the error message from the response data
    const message = error.response.data?.message || error.response.data

    if (typeof message === "string") {
      throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
    }

    throw new Error("An error occurred while processing your request.")
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("No response received: " + error.request)
  } else {
    // Something happened in setting up the request that triggered an Error
    // Check if error.message already contains a meaningful message
    const errorMessage = error.message || "An unexpected error occurred"
    
    // If the error message already contains useful information, use it directly
    if (errorMessage.includes("Sales channel") || errorMessage.includes("stock location")) {
      throw new Error(errorMessage)
    }
    
    throw new Error("Error setting up the request: " + errorMessage)
  }
}
