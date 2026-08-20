// `blobStorage` auto-imported from server/utils/blob.ts.

// GET /api/files/** — Serve uploaded files (local dev proxy)
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  if (!path) {
    throw createError({ statusCode: 400, message: 'Path required' })
  }

  return blobStorage.serve(event, path)
})
