<script setup lang="ts">
defineProps<{
  post: PostListItem
}>()

defineEmits<{
  click: []
}>()

const cardEl = ref<HTMLElement | null>(null)
defineExpose({ el: cardEl })

const boardStore = useBoardStore()
const { boardMap } = storeToRefs(boardStore)
</script>

<template>
  <div
    ref="cardEl"
    class="group bg-card border border-border p-5 rounded-lg shadow-sm hover:shadow-warm transition-all cursor-pointer"
    @click="$emit('click')"
  >
    <h4
      class="text-base font-bold mb-2 leading-tight truncate"
    >
      {{ post.title }}
    </h4>
    <p class="text-xs text-muted-foreground line-clamp-1 mb-4">{{ post.excerpt }}</p>

    <!-- Bottom meta -->
    <div class="flex items-center justify-between mt-auto pt-4 border-t border-dashed border-border/50">
      <span
        v-if="post.boardId && boardMap.get(post.boardId)"
        class="text-[10px] font-bold text-muted-foreground"
      >
        {{ boardMap.get(post.boardId) }}
      </span>
      <span v-else />
      <div class="flex items-center gap-3 text-muted-foreground">
        <div class="flex items-center gap-1 text-[11px] font-bold">
          <Icon name="lucide:chevron-up" size="14" /> {{ post.voteCount }}
        </div>
        <div class="flex items-center gap-1 text-[11px] font-bold">
          <Icon name="lucide:message-square" size="14" /> {{ post.commentCount }}
        </div>
      </div>
    </div>
  </div>
</template>
