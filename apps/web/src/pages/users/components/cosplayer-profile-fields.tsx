import { type Control, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DynamicListInput } from '@/components/ui/dynamic-list-input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export function CosplayerProfileFields<T extends FieldValues = any>({
  control,
}: {
  control: Control<T, any>
}) {
  const { t } = useTranslation()
  const formControl = control as unknown as Control<any>

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('users.cosplayerProfile.title', 'Hồ sơ Cosplayer')}
        </CardTitle>
        <CardDescription>
          {t(
            'users.cosplayerProfile.description',
            'Thông tin hiển thị trên trang hồ sơ Cosplayer công khai'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='mt-2 space-y-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <FormField
            control={formControl}
            name='cosplayerProfile.displayName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('users.show.cosplayerDisplayName', 'Tên hiển thị')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='KIRIKO Cosplay'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.slug'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('users.show.cosplayerSlug', 'Đường dẫn (Slug)')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='kiriko-cos'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.roleBadge'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('users.show.cosplayerBadge', 'Huy hiệu vai trò')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Cosplayer'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.tagline'
            render={({ field }) => (
              <FormItem className='md:col-span-2'>
                <FormLabel>Tagline</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Cosplayer & Props Maker tại Hà Nội...'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.locationLabel'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa điểm</FormLabel>
                <FormControl>
                  <Input
                    placeholder='TP. Hồ Chí Minh'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.workArea'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khu vực hoạt động</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Hà Nội, TP.HCM'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.heightCm'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chiều cao (cm)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={100}
                    max={250}
                    placeholder='165'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.experienceYearsNum'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số năm kinh nghiệm</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    max={50}
                    placeholder='3'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.contactEmail'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email liên hệ</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='contact@example.com'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.contactPhone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại liên hệ</FormLabel>
                <FormControl>
                  <Input
                    placeholder='0987654321'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.avatarUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://...'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.coverUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://...'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.facebookUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://facebook.com/...'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.instagramUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://instagram.com/...'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.tiktokUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>TikTok URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://tiktok.com/@...'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.twitterUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>X / Twitter URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://x.com/...'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <FormField
            control={formControl}
            name='cosplayerProfile.skillsText'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kỹ năng (Skills)</FormLabel>
                <FormControl>
                  <DynamicListInput
                    placeholder='Thêm kỹ năng...'
                    value={
                      field.value
                        ? String(field.value)
                            .split(',')
                            .map((s: string) => s.trim())
                            .filter(Boolean)
                        : []
                    }
                    onChange={(tags) => field.onChange(tags.join(', '))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.specialtiesText'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sở trường / Series</FormLabel>
                <FormControl>
                  <DynamicListInput
                    placeholder='Thêm series, tác phẩm...'
                    value={
                      field.value
                        ? String(field.value)
                            .split(',')
                            .map((s: string) => s.trim())
                            .filter(Boolean)
                        : []
                    }
                    onChange={(tags) => field.onChange(tags.join(', '))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.awardsBadgesText'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giải thưởng / Danh hiệu</FormLabel>
                <FormControl>
                  <DynamicListInput
                    placeholder='Thêm giải thưởng...'
                    value={
                      field.value
                        ? String(field.value)
                            .split(',')
                            .map((s: string) => s.trim())
                            .filter(Boolean)
                        : []
                    }
                    onChange={(tags) => field.onChange(tags.join(', '))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={formControl}
            name='cosplayerProfile.bio'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới thiệu ngắn (Bio)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder='Giới thiệu ngắn gọn về Cosplayer...'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.artisticBio'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiểu sử nghệ thuật (Artistic Bio)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder='Hành trình hoạt động cosplay, phong cách cá nhân...'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-3 pt-1'>
          <FormField
            control={formControl}
            name='cosplayerProfile.isVerified'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between gap-4 space-y-0 rounded-lg border p-4'>
                <div className='min-w-0 space-y-1'>
                  <FormLabel className='cursor-pointer font-medium'>
                    {t(
                      'users.show.cosplayerVerified',
                      'Tích xanh Cosplayer (Verified)'
                    )}
                  </FormLabel>
                  <p className='text-muted-foreground text-sm'>
                    {t(
                      'users.show.cosplayerVerifiedDescription',
                      'Xác nhận đây là hồ sơ Cosplayer chính thức đã được kiểm duyệt.'
                    )}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) =>
                      field.onChange(Boolean(checked))
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={formControl}
            name='cosplayerProfile.isCraftingCreator'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between gap-4 space-y-0 rounded-lg border p-4'>
                <div className='min-w-0 space-y-1'>
                  <FormLabel className='cursor-pointer font-medium'>
                    {t(
                      'users.show.craftingCreator',
                      'Crafting Creator (Props maker)'
                    )}
                  </FormLabel>
                  <p className='text-muted-foreground text-sm'>
                    {t(
                      'users.show.craftingCreatorDescription',
                      'Đánh dấu người chuyên chế tác trang phục, đạo cụ hoặc props.'
                    )}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) =>
                      field.onChange(Boolean(checked))
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
