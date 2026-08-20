// Shared onUploadImg handler for md-editor-v3
export function useUploadImg() {
  async function onUploadImg(files: File[], callback: (urls: string[]) => void) {
    const urls: string[] = []

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const result = await $fetch<{ key: string }>('/api/upload', {
          method: 'POST',
          body: formData,
        })
        urls.push(`attachment:${result.key}`)
      } catch {
        // skip failed uploads silently — editor will show empty image
      }
    }

    callback(urls)
  }

  return { onUploadImg }
}
