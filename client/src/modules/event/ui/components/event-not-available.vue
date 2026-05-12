<script setup lang="ts">
import { Card, CardContent } from '@/ui/card'
</script>

<template>
  <Card class="mx-auto max-w-md">
    <CardContent class="flex flex-col items-center gap-3 p-10 text-center">
      <p class="text-xl font-semibold">Cet évènement n'est pas disponible</p>
      <p class="text-sm text-muted-foreground">Le lien est peut-être expiré, ou l'évènement est annulé.</p>
    </CardContent>
  </Card>
</template>
