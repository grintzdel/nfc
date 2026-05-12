<script setup lang="ts">
import { Card, CardContent } from '@/ui/card'

defineProps<{ bio: string | null }>()
</script>

<template>
  <Card v-if="bio">
    <CardContent class="p-5">
      <p class="text-sm leading-relaxed">{{ bio }}</p>
    </CardContent>
  </Card>
</template>
