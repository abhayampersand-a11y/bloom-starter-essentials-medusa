import {
  authenticate,
  defineMiddlewares
} from "@medusajs/framework/http"
import path from "path"
import fs from "fs"

console.log("[MIDDLEWARES] Loading middlewares.ts file")

const uploadsDir = "/tmp/medusa-uploads"
console.log("[MIDDLEWARES] Uploads directory:", uploadsDir)

// Review submissions carry base64-encoded images inline, which blows past the
// default JSON body limit. 5 images x 5MB, plus base64's ~33% overhead.
const REVIEW_BODY_SIZE_LIMIT = "35mb"

export default defineMiddlewares({
  routes: [
    {
      // allowUnregistered: the caller is mid-signup and has no customer record yet.
      matcher: "/store/auth-identity/me",
      method: "GET",
      middlewares: [
        authenticate("customer", ["bearer"], { allowUnregistered: true }),
      ],
    },
    {
      // Only signed-in customers can post a review; the reviewer's name comes
      // from their account rather than the request body.
      matcher: "/store/products/:id/reviews",
      method: "POST",
      bodyParser: { sizeLimit: REVIEW_BODY_SIZE_LIMIT },
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/admin/reviews",
      method: "POST",
      bodyParser: { sizeLimit: REVIEW_BODY_SIZE_LIMIT },
    },
    {
      matcher: "/uploads*",
      middlewares: [
        (req, res, next) => {
          const originalUrl = req.originalUrl || req.url
          console.log("[UPLOADS] Request:", req.method, originalUrl)
          
          // Extract filename from URL and remove trailing slash
          let filePath = originalUrl.replace(/^\/uploads\/?/, "")
          if (filePath.endsWith("/")) {
            filePath = filePath.slice(0, -1)
          }
          
          // Decode URL encoding
          filePath = decodeURIComponent(filePath)
          
          console.log("[UPLOADS] Decoded file path:", filePath)
          
          const fullPath = path.join(uploadsDir, filePath)
          
          // Check if file exists
          fs.stat(fullPath, (err, stats) => {
            if (err) {
              console.log("[UPLOADS] File not found:", fullPath)
              res.status(404).send("File not found")
              return
            }
            
            if (!stats.isFile()) {
              console.log("[UPLOADS] Not a file:", fullPath)
              res.status(404).send("Not a file")
              return
            }
            
            console.log("[UPLOADS] Serving file! Size:", stats.size, "bytes")
            
            // Send the file
            res.sendFile(fullPath, (err) => {
              if (err) {
                console.log("[UPLOADS] Error sending file:", err.message)
                if (!res.headersSent) {
                  res.status(500).send("Error serving file")
                }
              }
            })
          })
        },
      ],
    },
  ],
})
