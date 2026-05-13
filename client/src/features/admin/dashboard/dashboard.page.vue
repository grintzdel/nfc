<script setup lang="ts">
import { useGetActivations } from '@/modules/analytics/ui/hooks/queries/query/use-get-activations'
import { useGetActiveEvents } from '@/modules/analytics/ui/hooks/queries/query/use-get-active-events'
import { useGetBraceletsCount } from '@/modules/analytics/ui/hooks/queries/query/use-get-bracelets-count'
import { useGetInteractions } from '@/modules/analytics/ui/hooks/queries/query/use-get-interactions'
import { useGetNextEvent } from '@/modules/analytics/ui/hooks/queries/query/use-get-next-event'
import { useGetParticipantsCount } from '@/modules/analytics/ui/hooks/queries/query/use-get-participants-count'
import { useGetRevenue } from '@/modules/analytics/ui/hooks/queries/query/use-get-revenue'
import { useGetStock } from '@/modules/analytics/ui/hooks/queries/query/use-get-stock'
import AdminLayout from '@/ui/layout/admin-layout.vue'

import DashboardActivationsChart from './components/dashboard-activations-chart.vue'
import DashboardInteractionsChart from './components/dashboard-interactions-chart.vue'
import DashboardNextEvent from './components/dashboard-next-event.vue'
import DashboardStats from './components/dashboard-stats.vue'
import DashboardStock from './components/dashboard-stock.vue'

const { data: activeEvents } = useGetActiveEvents()
const { data: participantsCount } = useGetParticipantsCount()
const { data: braceletsCount } = useGetBraceletsCount()
const { data: revenue } = useGetRevenue()
const { data: activations } = useGetActivations()
const { data: interactions } = useGetInteractions()
const { data: nextEvent } = useGetNextEvent()
const { data: stock } = useGetStock()
</script>

<template>
  <AdminLayout title="Dashboard" subtitle="Vue d'ensemble de votre activite">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <DashboardStats
        :active-events="activeEvents"
        :participants-count="participantsCount"
        :bracelets-count="braceletsCount"
        :revenue="revenue"
      />

      <div class="flex flex-col gap-6 xl:flex-row">
        <DashboardActivationsChart :data="activations" class="flex-1" />
        <DashboardInteractionsChart :data="interactions" />
      </div>

      <div class="flex flex-col gap-6 xl:flex-row">
        <DashboardNextEvent :data="nextEvent" class="flex-1" />
        <DashboardStock :data="stock" />
      </div>
    </div>
  </AdminLayout>
</template>
