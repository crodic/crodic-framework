import { useQuery } from '@tanstack/react-query'
import http from '@/lib/http'
import {
  rankingSettingsSchema,
  type LeaderboardPreviewItem,
  type RankingSettings,
  type RankingSettingsFormValues,
} from './schema'

export const RANKING_SETTINGS_QUERY_KEY = ['admin_ranking_settings'] as const
export const RANKING_PREVIEW_QUERY_KEY = ['admin_ranking_preview'] as const

export async function apiGetRankingSettings(): Promise<RankingSettings> {
  const response = await http.get('/admin/rankings/settings')
  return rankingSettingsSchema.parse(response.data)
}

export async function apiUpdateRankingSettings(
  data: RankingSettingsFormValues
): Promise<RankingSettings> {
  const response = await http.put('/admin/rankings/settings', data)
  return rankingSettingsSchema.parse(response.data)
}

export async function apiTriggerRankingRecalculate(): Promise<{
  message: string
  processedCategories: string[]
  failedCategories: string[]
  timestamp: string
}> {
  const response = await http.post('/admin/rankings/recalculate')
  return response.data
}

export async function apiGetRankingPreview(): Promise<
  LeaderboardPreviewItem[]
> {
  const response = await http.get('/admin/rankings/preview')
  return response.data
}

export const useRankingSettings = () =>
  useQuery({
    queryKey: RANKING_SETTINGS_QUERY_KEY,
    queryFn: apiGetRankingSettings,
  })

export const useRankingPreview = () =>
  useQuery({
    queryKey: RANKING_PREVIEW_QUERY_KEY,
    queryFn: apiGetRankingPreview,
  })
