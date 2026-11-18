import { useQuery } from '@tanstack/react-query'
import http from '@/lib/http'
import {
  kosumeSettingsSchema,
  type KosumeSettings,
  type KosumeSettingsFormValues,
} from './schema'

export const KOSUME_SETTINGS_QUERY_KEY = ['kosume_settings'] as const

export async function apiGetKosumeSettings(): Promise<KosumeSettings> {
  const response = await http.get('/settings/platform/kosume')
  return kosumeSettingsSchema.parse(response.data)
}

export async function apiUpdateKosumeSettings(
  data: KosumeSettingsFormValues
): Promise<KosumeSettings> {
  const response = await http.put('/settings/platform/kosume', data)
  return kosumeSettingsSchema.parse(response.data)
}

export const useKosumeSettings = () =>
  useQuery({
    queryKey: KOSUME_SETTINGS_QUERY_KEY,
    queryFn: apiGetKosumeSettings,
  })
