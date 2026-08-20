// `auth` auto-imported from server/utils/better-auth.ts.
export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event))
})
