<script setup lang="ts">
const { state, handleConfirm, handleCancel } = useConfirmDialogState()

// AlertDialogAction/Cancel auto-close fires @update:open(false) BEFORE our @click handlers.
// Defer so explicit click handlers can resolve the promise first;
// if none fired (e.g. ESC key), this fallback resolves as cancel.
function onOpenChange(val: boolean) {
  if (!val) {
    setTimeout(() => { if (state.resolve) handleCancel() })
  }
}
</script>

<template>
  <!-- v-if ensures portal appends to body LAST when opened,
       naturally stacking above any existing dialogs (same z-index, later DOM order wins) -->
  <AlertDialog v-if="state.open" :open="true" @update:open="onOpenChange">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ state.options.title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="state.options.description">
          {{ state.options.description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="handleCancel">
          {{ state.options.cancelText || 'Cancel' }}
        </AlertDialogCancel>
        <AlertDialogAction
          :class="state.options.variant === 'destructive'
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : ''"
          @click="handleConfirm"
        >
          {{ state.options.confirmText || 'Confirm' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
