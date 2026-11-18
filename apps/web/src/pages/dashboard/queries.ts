import { useQuery } from '@tanstack/react-query'
import http from '@/lib/http'

export type AnalyticsOverview = {
  kpi: {
    totalUsers: number
    totalCosplayers: number
    verifiedCosplayers: number
    totalPosts: number
    featuredPosts: number
    activeEvents: number
    pendingReports: number
    pendingPosts: number
  }
  postCategories: { category: string; count: number }[]
}

export const ANALYTICS_OVERVIEW_QUERY_KEY = ['analytics_overview'] as const

export async function apiGetAnalyticsOverview(): Promise<AnalyticsOverview> {
  const response = await http.get('/admin/analytics/overview')
  return response.data
}

export const useAnalyticsOverview = () =>
  useQuery({
    queryKey: ANALYTICS_OVERVIEW_QUERY_KEY,
    queryFn: apiGetAnalyticsOverview,
  })
