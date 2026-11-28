import { format } from 'date-fns'
import {
  ArrowLeftIcon,
  Edit2Icon,
  KeyRoundIcon,
  LayersIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { useDataPermissionById } from '../queries'
import { FORBIDDEN_ROLE_PERMISSION_KEYS } from '../schema'

export default function PagePermissionShow() {
  const { t } = useTranslation()
  const params = useParams()
  const id = params.id as string
  const navigate = useNavigate()
  const { data, isFetching } = useDataPermissionById(id)

  const permName = data?.name || (id ? `#${id}` : '')

  useBreadcrumb([
    {
      title: t('navigation.management.permissions', 'Permissions'),
      href: '/permissions',
    },
    { title: permName },
  ])

  if (isFetching) return <DataLoader />

  if (!data) return <NotFoundError />

  const isReserved = FORBIDDEN_ROLE_PERMISSION_KEYS.includes(data.key)

  return (
    <>
      <Main>
        <div className='space-y-6'>
          <PageHeader
            title={<>{data.name}</>}
            description={<>{data.key}</>}
            badges={
              <>
                <Badge variant='secondary'>{data.group}</Badge>
                {isReserved && <Badge>Reserved</Badge>}
              </>
            }
            actions={
              <>
                <Button onClick={() => navigate(-1)} variant='outline'>
                  <ArrowLeftIcon className='size-4' aria-hidden='true' />
                  Back
                </Button>
                <Button
                  onClick={() => navigate(`/permissions/${data.id}/edit`)}
                >
                  <Edit2Icon className='size-4' aria-hidden='true' />
                  Edit metadata
                </Button>
              </>
            }
          />

          <div className='grid gap-4 md:grid-cols-3'>
            <Card>
              <CardContent className='flex items-center gap-3 p-4'>
                <div className='bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md'>
                  <ShieldCheckIcon className='size-5' aria-hidden='true' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Name</p>
                  <p className='font-medium'>{data.name}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-3 p-4'>
                <div className='bg-muted flex size-10 items-center justify-center rounded-md'>
                  <LayersIcon className='size-5' aria-hidden='true' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Group</p>
                  <p className='font-medium'>{data.group}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-3 p-4'>
                <div className='bg-muted flex size-10 items-center justify-center rounded-md'>
                  <KeyRoundIcon className='size-5' aria-hidden='true' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Updated</p>
                  <p className='text-sm font-medium tabular-nums'>
                    {format(data.updatedAt, 'yyyy-MM-dd HH:mm')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                This text helps admins understand what the permission allows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {data.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
