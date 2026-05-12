<script setup lang="ts">
import { Card, CardContent } from '@/ui/card'

defineProps<{ variant?: 'not-active' | 'network' }>()
</script>

<template>
  <Card class="mx-auto max-w-md">
    <CardContent class="flex flex-col items-center gap-3 p-10 text-center">
      <p class="text-lg font-semibold">
        <template v-if="variant === 'network'">Impossible de joindre le serveur</template>
        <template v-else>Ce bracelet n'est pas activé</template>
      </p>
      <p class="text-sm text-muted-foreground">
        <template v-if="variant === 'network'">Réessayez dans un instant.</template>
        <template v-else>Adressez-vous à l'organisateur de l'évènement.</template>
      </p>
    </CardContent>
  </Card>
</template>
