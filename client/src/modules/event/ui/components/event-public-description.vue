<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'

defineProps<{ description: string }>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-sm uppercase tracking-wider text-muted-foreground">À propos</CardTitle>
    </CardHeader>
    <CardContent>
      <p class="whitespace-pre-line">{{ description || 'Description à venir.' }}</p>
    </CardContent>
  </Card>
</template>
