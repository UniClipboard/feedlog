// /dashboard/* gate: any org staff (owner / manager / contributor) may enter.
// Fine-grained capability checks happen inside individual pages / API calls.
export default defineNuxtRouteMiddleware(async () => {
  const { data } = await useAuthSession()

  if (!data.value?.user) {
    return navigateTo('/')
  }

  // SSO sessions are end-user only — never staff, even if this email is an org
  // member. Server gates 403 regardless; bounce here too so the
  // dashboard never half-renders before the API calls fail.
  const ssoOrgId = (data.value as { session?: { ssoOrgId?: string | null } }).session?.ssoOrgId
  if (ssoOrgId) {
    return navigateTo('/')
  }

  const orgList = (data.value as { orgList?: { role: string }[] }).orgList
  if (!orgList || orgList.length === 0) {
    return navigateTo('/')
  }
})
