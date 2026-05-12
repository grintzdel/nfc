<script setup lang="ts">
import { ref } from 'vue'
import { QrcodeStream, type DetectedBarcode } from 'vue-qrcode-reader'

const props = withDefaults(defineProps<{ paused?: boolean }>(), { paused: false })

const emit = defineEmits<{
  scan: [value: string]
  error: [error: { name: string; message: string }]
}>()

const cameraError = ref<{ name: string; message: string } | null>(null)

function handleDetect(detections: DetectedBarcode[]): void {
  if (props.paused || detections.length === 0) return
  const first = detections[0]
  if (!first?.rawValue) return
  emit('scan', first.rawValue)
}

function handleError(err: unknown): void {
  const e = err as { name?: string; message?: string }
  const payload = { name: e.name ?? 'CameraError', message: e.message ?? String(err) }
  cameraError.value = payload
  emit('error', payload)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="relative overflow-hidden rounded-lg border border-white/10 bg-black">
      <QrcodeStream
        :paused="paused"
        :formats="['qr_code']"
        class="w-full"
        @detect="handleDetect"
        @error="handleError"
      />
    </div>
    <div
      v-if="cameraError"
      class="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
    >
      <strong>{{ cameraError.name }}</strong> — {{ cameraError.message }}
    </div>
  </div>
</template>
