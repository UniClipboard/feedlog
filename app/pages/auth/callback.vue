<script setup lang="ts">
import { toast } from 'vue-sonner'
import { consumeAuthResume } from '~/lib/auth-resume'

const route = useRoute()
const { t } = useI18n()
const { setPending } = usePendingAction()

onMounted(async () => {
  const resume = consumeAuthResume(window.sessionStorage, {
    origin: window.location.origin,
  })
  if (resume?.intent) setPending(resume.intent)

  const error = typeof route.query.error === 'string' ? route.query.error : null
  const returnTo = resume?.returnTo === '/auth/callback' ? '/' : (resume?.returnTo ?? '/')
  await navigateTo(returnTo, { replace: true })

  if (error === 'access_denied') toast.error(t('auth.errors.signInCancelled'))
  else if (error) toast.error(t('auth.errors.signInFailed'))
})
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <p class="text-muted-foreground">{{ $t('auth.signingIn') }}</p>
  </div>
</template>
