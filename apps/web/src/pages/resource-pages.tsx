import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import http from '@/lib/http'
import { RecordPage } from '@/components/layout/record-page'
import { ReportReview } from './content-reports/components/review'
import { apiGetContentReportById } from './content-reports/queries'
import { ApplicationReview } from './cosplayer-applications/review'
import { cosplayerApplicationSchema } from './cosplayer-applications/schema'
import { LogDetail } from './cron-jobs/components/log-detail'
import { getCronJobLogDetail } from './cron-jobs/queries'
import { CityEditor } from './locations/editors/city-editor'
import { CountryEditor } from './locations/editors/country-editor'
import { RegionEditor } from './locations/editors/region-editor'
import { StateEditor } from './locations/editors/state-editor'
import {
  countrySchema,
  stateSchema,
  citySchema,
  regionSchema,
} from './locations/schema'
import { PostDetail } from './posts/components/detail'
import { PostStatusEditor } from './posts/components/status-editor'
import { apiGetAdminPostById } from './posts/queries'
import { SpotlightBannerEditor } from './spotlight-banners/components/editor'
import { spotlightBannerSchema } from './spotlight-banners/schema'
import { TagCategoryEditor } from './tag-categories/editor'
import { tagCategorySchema } from './tag-categories/schema'

export function TagCategoryPage({ create = false }: { create?: boolean }) {
  const { t } = useTranslation()
  return (
    <RecordPage
      title={t('navigation.management.tagCategories', 'Tag Categories')}
      backTo='/tag-categories'
      create={create}
      showBack={false}
      load={async (id) =>
        tagCategorySchema.parse((await http.get(`/tag-categories/${id}`)).data)
      }
    >
      {(category, onClose) => (
        <TagCategoryEditor category={category} onClose={onClose} />
      )}
    </RecordPage>
  )
}
export function SpotlightBannerPage({ create = false }: { create?: boolean }) {
  const { t } = useTranslation()
  return (
    <RecordPage
      title={t('navigation.kosume.spotlight', 'Spotlight Banners')}
      backTo='/spotlight-banners'
      create={create}
      showBack={false}
      load={async (id) =>
        spotlightBannerSchema.parse(
          (await http.get(`/admin/spotlight-banners/${id}`)).data
        )
      }
    >
      {(banner, onClose) => (
        <SpotlightBannerEditor banner={banner} onClose={onClose} />
      )}
    </RecordPage>
  )
}
export function PostPage({ edit = false }: { edit?: boolean }) {
  const { t } = useTranslation()
  const client = useQueryClient()
  return (
    <RecordPage
      title={t('navigation.kosume.posts', 'Posts')}
      backTo='/posts'
      load={apiGetAdminPostById}
      showBack={!edit}
    >
      {(post, onClose) =>
        edit ? (
          <PostStatusEditor
            post={post}
            onClose={onClose}
            onSuccess={() => {
              void client.invalidateQueries({ queryKey: ['admin-posts'] })
            }}
          />
        ) : (
          <PostDetail post={post} />
        )
      }
    </RecordPage>
  )
}
export function ApplicationPage() {
  const { t } = useTranslation()
  return (
    <RecordPage
      title={t(
        'navigation.kosume.cosplayerApplications',
        'Cosplayer Applications'
      )}
      backTo='/cosplayer-applications'
      load={async (id) =>
        cosplayerApplicationSchema.parse(
          (await http.get(`/admin/cosplayer-applications/${id}`)).data
        )
      }
    >
      {(application, onClose) => (
        <ApplicationReview application={application} onClose={onClose} />
      )}
    </RecordPage>
  )
}
export function ReportPage() {
  const { t } = useTranslation()
  return (
    <RecordPage
      title={t('navigation.kosume.contentReports', 'Content Reports')}
      backTo='/content-reports'
      load={apiGetContentReportById}
    >
      {(report, onClose) => <ReportReview report={report} onClose={onClose} />}
    </RecordPage>
  )
}
export function CronLogPage() {
  return (
    <RecordPage
      title='Execution Log'
      backTo='/cron-jobs'
      load={getCronJobLogDetail}
    >
      {(log) => <LogDetail log={log} />}
    </RecordPage>
  )
}
export function LocationPage({
  kind,
  create = false,
}: {
  kind: 'countries' | 'states' | 'cities' | 'regions'
  create?: boolean
}) {
  const { t } = useTranslation()
  const backTo = `/locations?tab=${kind}`
  const title = t(`locations.tabs.${kind}`, kind)
  if (kind === 'countries')
    return (
      <RecordPage
        title={title}
        backTo={backTo}
        create={create}
        showBack={false}
        load={async (id) =>
          countrySchema.parse((await http.get(`/countries/${id}`)).data)
        }
      >
        {(country, onClose) => (
          <CountryEditor country={country} onClose={onClose} />
        )}
      </RecordPage>
    )
  if (kind === 'states')
    return (
      <RecordPage
        title={title}
        backTo={backTo}
        create={create}
        showBack={false}
        load={async (id) =>
          stateSchema.parse((await http.get(`/states/${id}`)).data)
        }
      >
        {(state, onClose) => <StateEditor state={state} onClose={onClose} />}
      </RecordPage>
    )
  if (kind === 'cities')
    return (
      <RecordPage
        title={title}
        backTo={backTo}
        create={create}
        showBack={false}
        load={async (id) =>
          citySchema.parse((await http.get(`/cities/${id}`)).data)
        }
      >
        {(city, onClose) => <CityEditor city={city} onClose={onClose} />}
      </RecordPage>
    )
  return (
    <RecordPage
      title={title}
      backTo={backTo}
      create={create}
      showBack={false}
      load={async (id) =>
        regionSchema.parse((await http.get(`/regions/${id}`)).data)
      }
    >
      {(region, onClose) => <RegionEditor region={region} onClose={onClose} />}
    </RecordPage>
  )
}
