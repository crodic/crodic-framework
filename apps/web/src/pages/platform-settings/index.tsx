import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { HardDrive, HelpCircle, Save, ShieldAlert, Sliders } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import {
  apiUpdateKosumeSettings,
  KOSUME_SETTINGS_QUERY_KEY,
  useKosumeSettings,
} from './queries'
import {
  kosumeSettingsFormSchema,
  type KosumeSettingsFormValues,
} from './schema'

export function PagePlatformSettings() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Quản trị Kosume') },
    { title: t('navigation.kosume.settings', 'Cài đặt nền tảng') },
  ])

  const { data: settings, isLoading } = useKosumeSettings()

  const form = useForm<KosumeSettingsFormValues>({
    resolver: zodResolver(kosumeSettingsFormSchema),
    defaultValues: {
      max_photos_per_album: 50,
      max_file_size_mb: 25,
      auto_approve_posts: true,
      commission_platform_rate_percent: 5,
      cosplay_confidence_threshold_percent: 50,
      banned_keywords: 'nude, nsfw, spam, scam, lừa đảo, cờ bạc',
      support_email: 'support@kosume.com',
      support_hotline: '1900-KOSUME',
    },
  })

  useEffect(() => {
    if (settings) {
      form.reset(settings)
    }
  }, [settings, form])

  const mutation = useMutation({
    mutationFn: apiUpdateKosumeSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(KOSUME_SETTINGS_QUERY_KEY, data)
      toast.success(
        t('platformSettings.messages.saved', 'Lưu cài đặt nền tảng thành công')
      )
    },
    onError: () => {
      toast.error(
        t('platformSettings.messages.error', 'Không thể lưu cài đặt nền tảng')
      )
    },
  })

  const onSubmit = (values: KosumeSettingsFormValues) => {
    mutation.mutate(values)
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <Sliders className='text-primary size-6' />
            <span>
              {t(
                'navigation.kosume.settings',
                'Cài đặt nghiệp vụ nền tảng Kosume'
              )}
            </span>
          </div>
        }
        description={t(
          'platformSettings.description',
          'Cấu hình quy chuẩn kiểm duyệt, tỷ lệ hoa hồng booking, dung lượng tải lên và bộ lọc an toàn toàn sàn.'
        )}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Column 1: Upload policies & Content safety filter */}
            <div className='space-y-6'>
              {/* Section 1: Upload & Album Policies */}
              <Card>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <HardDrive className='text-primary size-5' />
                    <CardTitle>
                      {t(
                        'platformSettings.uploadTitle',
                        'Quy định tải lên & Album bài đăng'
                      )}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {t(
                      'platformSettings.uploadDesc',
                      'Thiết lập giới hạn số lượng ảnh và dung lượng tệp cho mỗi tác phẩm trên Studio Feed.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='max_photos_per_album'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t(
                              'platformSettings.maxPhotos',
                              'Số ảnh tối đa mỗi Album'
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              max={200}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            {t(
                              'platformSettings.maxPhotosHelp',
                              'Khuyến nghị: 30 - 60 ảnh'
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='max_file_size_mb'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t(
                              'platformSettings.maxFileSize',
                              'Dung lượng tệp tối đa (MB)'
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              max={100}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            {t(
                              'platformSettings.maxFileSizeHelp',
                              'Mỗi ảnh đơn lẻ (VD: 25 MB)'
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='auto_approve_posts'
                    render={({ field }) => (
                      <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                        <div className='space-y-0.5'>
                          <FormLabel>
                            {t(
                              'platformSettings.autoApprovePosts',
                              'Tự động duyệt bài đăng'
                            )}
                          </FormLabel>
                          <FormDescription>
                            {t(
                              'platformSettings.autoApprovePostsHelp',
                              'Bài đăng mới của người dùng sẽ hiển thị ngay lập tức mà không cần qua hàng đợi chờ duyệt.'
                            )}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='cosplay_confidence_threshold_percent'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            'platformSettings.cosplayConfidenceThreshold',
                            'Độ tin cậy Cosplay tối thiểu của AI (%)'
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            max={100}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            'platformSettings.cosplayConfidenceThresholdHelp',
                            'Ngưỡng tin cậy của mô hình AI CLIP (0-100%). Mặc định 50%. Nhập 0% để tắt tính năng tự động kiểm duyệt AI. Ảnh hoặc video dưới mức này sẽ bị chặn tải lên.'
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Section 3: Safe Filter & Banned Keywords */}
              <Card>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <ShieldAlert className='size-5 text-rose-500' />
                    <CardTitle>
                      {t(
                        'platformSettings.filterTitle',
                        'Bộ lọc từ khóa cấm & An toàn cộng đồng'
                      )}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {t(
                      'platformSettings.filterDesc',
                      'Danh sách các từ khóa nhạy cảm, spam hoặc nội dung không phù hợp (phân cách bởi dấu phẩy).'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name='banned_keywords'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder='từ_khóa_1, từ_khóa_2, từ_khóa_3...'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            'platformSettings.filterHelp',
                            'Nội dung chứa các từ khóa này sẽ tự động bị gắn cờ hoặc chuyển sang trạng thái chờ duyệt.'
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Support contacts */}
            <div className='space-y-6'>
              {/* Section 2: Contact & Helpline */}
              <Card>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <HelpCircle className='size-5 text-blue-500' />
                    <CardTitle>
                      {t(
                        'platformSettings.supportTitle',
                        'Kênh hỗ trợ người dùng & Hotline'
                      )}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {t(
                      'platformSettings.supportDesc',
                      'Kênh hỗ trợ giải quyết sự cố, hotline khẩn cấp cho người dùng và đối tác.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='support_email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('platformSettings.supportEmail', 'Email hỗ trợ')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='support@kosume.com'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='support_hotline'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t(
                              'platformSettings.supportHotline',
                              'Hotline hỗ trợ'
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder='1900-KOSUME' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className='flex justify-end'>
            <Button
              type='submit'
              size='lg'
              disabled={mutation.isPending || isLoading}
            >
              <Save className='mr-2 size-4' />
              {mutation.isPending
                ? t('common.saving', 'Đang lưu...')
                : t('platformSettings.saveButton', 'Lưu thay đổi cài đặt')}
            </Button>
          </div>
        </form>
      </Form>
    </Main>
  )
}
