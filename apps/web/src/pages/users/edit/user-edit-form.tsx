import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, SaveIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main'
import { CosplayerProfileFields } from '../components/cosplayer-profile-fields'
import { apiEditUser, apiHandleCosplayerRequest } from '../queries'
import {
  serializeCosplayerProfilePayload,
  type UserEditSchema,
  userEditSchema,
  type UserSchema,
} from '../schema'

export function UserEditForm({ data }: { data: UserSchema }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const cp = data.cosplayerProfile
  const isPendingRequest =
    Boolean(data.cosplayerRequestPending) ||
    Boolean(data.notifications?.cosplayerRoleRequested)

  const form = useForm<UserEditSchema>({
    defaultValues: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName ?? undefined,
      username: data.username ?? undefined,
      cosplayerProfile: cp
        ? {
            displayName: cp.displayName ?? '',
            slug: cp.slug ?? '',
            roleBadge: cp.roleBadge ?? '',
            tagline: cp.tagline ?? '',
            bio: cp.bio ?? '',
            artisticBio: cp.artisticBio ?? '',
            avatarUrl: cp.avatarUrl ?? '',
            coverUrl: cp.coverUrl ?? '',
            locationLabel: cp.locationLabel ?? '',
            workArea: cp.workArea ?? '',
            heightCm: cp.heightCm ?? undefined,
            experienceYearsNum: cp.experienceYearsNum ?? undefined,
            skillsText: (cp.skills || []).join(', '),
            specialtiesText: (cp.specialties || []).join(', '),
            awardsBadgesText: (cp.awardsBadges || []).join(', '),
            contactEmail: cp.contactEmail ?? '',
            contactPhone: cp.contactPhone ?? '',
            facebookUrl: cp.facebookUrl ?? '',
            instagramUrl: cp.instagramUrl ?? '',
            tiktokUrl: cp.tiktokUrl ?? '',
            twitterUrl: cp.twitterUrl ?? '',
            isVerified: Boolean(cp.isVerified),
            isCraftingCreator: Boolean(cp.isCraftingCreator),
          }
        : undefined,
    },
    resolver: zodResolver(userEditSchema),
  })

  const requestMutation = useMutation({
    mutationFn: apiHandleCosplayerRequest,
    onSuccess: async (_res, vars) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['user', data.id] })
      toast.success(
        vars.approved
          ? 'Đã duyệt yêu cầu trở thành Cosplayer'
          : 'Đã từ chối yêu cầu trở thành Cosplayer'
      )
    },
    onError: restApiErrorHandler,
  })

  const editUserMutation = useMutation({
    mutationFn: apiEditUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('User updated successfully')
      navigate(-1)
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: UserEditSchema) => {
    if (data.id) {
      const payload: Record<string, unknown> = {
        firstName: values.firstName,
        lastName: values.lastName ?? '',
        username: values.username?.trim() ?? '',
      }
      if (values.cosplayerProfile || Boolean(cp)) {
        const serialized = serializeCosplayerProfilePayload(
          values.cosplayerProfile
        )
        if (serialized) {
          payload.cosplayerProfile = serialized
        }
      }
      editUserMutation.mutate({ id: data.id, data: payload })
    }
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <div className='mb-2 flex flex-col items-baseline justify-between space-y-2 sm:flex-row sm:items-center'>
            <div className='flex flex-row space-x-2'>
              <h2 className='text-2xl font-bold tracking-tight'>
                {t('users.edit.title')}
              </h2>
            </div>
            <div className='flex w-full flex-wrap justify-end gap-2 sm:block sm:w-auto sm:justify-normal sm:space-x-2'>
              <Button
                variant='outline'
                type='button'
                onClick={() => {
                  void navigate(-1)
                }}
              >
                <ArrowLeftIcon className='size-4' aria-hidden='true' />
                {t('buttons.cancel')}
              </Button>
              <Button type='submit'>
                <SaveIcon className='size-4' aria-hidden='true' />
                {t('buttons.save')}
              </Button>
            </div>
          </div>

          {isPendingRequest && (
            <Card className='border-amber-500/40 bg-amber-500/10'>
              <CardContent className='flex flex-col items-start justify-between gap-3 pt-6 sm:flex-row sm:items-center'>
                <div>
                  <p className='text-sm font-semibold text-amber-700 dark:text-amber-300'>
                    Người dùng này đã gửi yêu cầu trở thành Cosplayer
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    Bạn có thể phê duyệt ngay tại đây hoặc từ chối yêu cầu.
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    disabled={requestMutation.isPending}
                    onClick={() =>
                      requestMutation.mutate({ id: data.id, approved: false })
                    }
                  >
                    Từ chối
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    disabled={requestMutation.isPending}
                    onClick={() =>
                      requestMutation.mutate({ id: data.id, approved: true })
                    }
                  >
                    Phê duyệt Cosplayer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('users.edit.title')}</CardTitle>
              <CardDescription>{t('users.edit.description')}</CardDescription>
            </CardHeader>
            <CardContent className='mt-4 flex flex-col gap-4 sm:gap-8 md:grid md:grid-cols-3'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('users.edit.email')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='test@example.com'
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('users.edit.firstName')}</FormLabel>
                    <FormControl>
                      <Input placeholder='John' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.edit.lastName')}</FormLabel>
                    <FormControl>
                      <Input placeholder='Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder='kiriko_cos' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <CosplayerProfileFields control={form.control} />

          <div className='mb-2 flex flex-col items-baseline justify-between space-y-2 sm:flex-row sm:items-center'>
            <div className='flex flex-row space-x-2'></div>
            <div className='flex w-full flex-wrap justify-end gap-2 sm:block sm:w-auto sm:justify-normal sm:space-x-2'>
              <Button
                variant='outline'
                type='button'
                onClick={() => {
                  void navigate(-1)
                }}
              >
                <ArrowLeftIcon className='size-4' aria-hidden='true' />
                {t('buttons.cancel')}
              </Button>
              <Button type='submit'>
                <SaveIcon className='size-4' aria-hidden='true' />
                {t('buttons.save')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Main>
  )
}
