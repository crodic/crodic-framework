import { format } from 'date-fns'
import { ArrowLeftIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DescriptionItem, Descriptions } from '@/components/common/descriptions'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { useDataEmailLogDetail } from '@/pages/email-logs/queries'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { EmailPreview } from './email-preview'

export default function PageEmailLogShow() {
  const { t } = useTranslation()
  const params = useParams()
  const navigate = useNavigate()
  const { data, isFetching } = useDataEmailLogDetail(params.id as string)

  const emailSubject =
    data?.subject || (params.id ? `#${params.id.slice(0, 8)}` : '')

  useBreadcrumb([
    {
      title: t('navigation.general.emailLogs', 'Email Logs'),
      href: '/email-logs',
    },
    { title: emailSubject },
  ])

  if (isFetching) return <DataLoader />
  if (!data) return <NotFoundError />

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'SENT':
        return <Badge variant='solid-success'>{status}</Badge>
      case 'FAILED':
      case 'BOUNCED':
        return <Badge variant='destructive'>{status}</Badge>
      case 'QUEUED':
      case 'PENDING':
        return <Badge variant='solid-warning'>{status}</Badge>
      default:
        return <Badge variant='secondary'>{status}</Badge>
    }
  }

  return (
    <>
      <Main>
        <div className='space-y-6'>
          <PageHeader
            title={<>{t('emailLogs.show.title')}</>}
            description={<>{data.subject}</>}
            actions={
              <>
                <Button
                  onClick={() => navigate(-1)}
                  variant='outline'
                  size='sm'
                  className='gap-1.5 self-start sm:self-auto'
                >
                  <ArrowLeftIcon size={16} />
                  {t('buttons.back')}
                </Button>
              </>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>{t('emailLogs.show.delivery')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Descriptions>
                <DescriptionItem
                  label={t('emailLogs.show.status')}
                  value={getStatusBadge(data.status)}
                />
                <DescriptionItem
                  label={t('emailLogs.show.source')}
                  value={data.source}
                />
                <DescriptionItem
                  label={t('emailLogs.show.from')}
                  value={data.from}
                />
                <DescriptionItem
                  label={t('emailLogs.show.to')}
                  value={data.to.join(', ')}
                />
                <DescriptionItem
                  label={t('emailLogs.show.cc')}
                  value={data.cc?.join(', ') || '-'}
                />
                <DescriptionItem
                  label={t('emailLogs.show.bcc')}
                  value={data.bcc?.join(', ') || '-'}
                />
                <DescriptionItem
                  label={t('emailLogs.show.scheduledAt')}
                  value={
                    data.scheduledAt
                      ? format(data.scheduledAt, 'dd/MM/yyyy HH:mm')
                      : '-'
                  }
                />
                <DescriptionItem
                  label={t('emailLogs.show.sentAt')}
                  value={
                    data.sentAt ? format(data.sentAt, 'dd/MM/yyyy HH:mm') : '-'
                  }
                />
                <DescriptionItem
                  label={t('emailLogs.show.job')}
                  value={data.queueJobId || '-'}
                />
                <DescriptionItem
                  label={t('emailLogs.show.error')}
                  value={data.errorMessage || '-'}
                />
              </Descriptions>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('emailLogs.show.bodyPreview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailPreview html={data.renderedBody || data.body || ''} />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
