<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { QrCodeDomainModel } from '@/modules/qrcode/core/model/qrcode.domain-model'

const props = withDefaults(
  defineProps<{
    value: string
    size?: number
    errorCorrectionLevel?: QrCodeDomainModel.ErrorCorrectionLevel
    alt?: string
  }>(),
  { size: 256, errorCorrectionLevel: 'M', alt: 'QR code' },
)

const { qrCodePort } = useDependencies()

const dataUrl = ref<string | null>(null)
const error = ref<string | null>(null)

async function regenerate(): Promise<void> {
  error.value = null
  if (!props.value) {
    dataUrl.value = null
    return
  }
  try {
    dataUrl.value = await qrCodePort.generateDataUrl(props.value, {
      size: props.size,
      errorCorrectionLevel: props.errorCorrectionLevel,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to generate QR'
    dataUrl.value = null
  }
}

watch(() => [props.value, props.size, props.errorCorrectionLevel], regenerate, { immediate: true })
</script>

<template>
  <div class="inline-flex flex-col items-center gap-2">
    <img
      v-if="dataUrl"
      :src="dataUrl"
      :alt="alt"
      :width="size"
      :height="size"
      class="rounded-md bg-white p-2"
    />
    <div
      v-else-if="error"
      class="flex h-32 w-32 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 px-3 text-xs text-red-300"
    >
      {{ error }}
    </div>
    <div
      v-else
      class="flex h-32 w-32 items-center justify-center rounded-md border border-white/10 bg-slate-800/50 text-xs text-slate-500"
    >
      Génération…
    </div>
  </div>
</template>
