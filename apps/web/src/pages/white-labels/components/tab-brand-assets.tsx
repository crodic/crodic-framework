import type { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { WhiteLabelFormSchema, WhiteLabelSchema } from '../schema'
import { WhiteLabelAssetField } from './white-label-asset-field'

type TabBrandAssetsProps = {
  form: UseFormReturn<WhiteLabelFormSchema>
  initialData?: WhiteLabelSchema | null
}

export function TabBrandAssets({ form, initialData }: TabBrandAssetsProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>
            {t('whiteLabels.show.profileDetails', 'Profile Configuration')}
          </CardTitle>
          <CardDescription>
            {t(
              'whiteLabels.show.profileDetailsDesc',
              'Profile name, target application scope, and activation status.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t('whiteLabels.form.name', 'Profile Name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'whiteLabels.form.namePlaceholder',
                        'e.g., Default Blue, Acme Corp'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='target'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('whiteLabels.form.targetScope', 'Target Scope')}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                      className='flex items-center gap-4 pt-1.5'
                    >
                      <label className='flex cursor-pointer items-center space-x-2 text-sm leading-none font-medium'>
                        <RadioGroupItem value='admin' id='target-admin' />
                        <span>
                          {t('whiteLabels.form.targetAdmin', 'Admin Portal')}
                        </span>
                      </label>
                      <label className='flex cursor-pointer items-center space-x-2 text-sm leading-none font-medium'>
                        <RadioGroupItem value='client' id='target-client' />
                        <span>
                          {t('whiteLabels.form.targetClient', 'Client App')}
                        </span>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('whiteLabels.show.description', 'Description')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder={t(
                      'whiteLabels.form.descriptionPlaceholder',
                      'Brief description of this white label profile'
                    )}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='isActive'
            render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-lg border p-3 shadow-xs'>
                <div className='space-y-0.5'>
                  <FormLabel
                    htmlFor='target-is-active-switch'
                    className='cursor-pointer text-sm font-medium'
                  >
                    {t('whiteLabels.form.isDefault', 'Set as Active Profile')}
                  </FormLabel>
                  <FormDescription className='text-xs'>
                    {t(
                      'whiteLabels.form.isDefaultDesc',
                      'When active, this profile immediately drives the branding and theme across the selected target.'
                    )}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    id='target-is-active-switch'
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>
            {t('whiteLabels.show.brandIdentity', 'Brand Identity & Copy')}
          </CardTitle>
          <CardDescription>
            {t(
              'whiteLabels.show.brandIdentityDesc',
              'Brand names and slogans displayed in headers, footers, and auth screens.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='brandName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('whiteLabels.form.brandName', 'Brand Name')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'whiteLabels.form.brandNamePlaceholder',
                      'e.g., Visel Art'
                    )}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='siteTitle'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('whiteLabels.form.siteTitle', 'Site Title')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'whiteLabels.form.siteTitlePlaceholder',
                      'e.g., Visel Art Admin Portal'
                    )}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='siteTagline'
            render={({ field }) => (
              <FormItem className='sm:col-span-2'>
                <FormLabel>
                  {t('whiteLabels.form.tagline', 'Tagline / Slogan')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'whiteLabels.form.taglinePlaceholder',
                      'e.g., Creative Art & Modern Management Platform'
                    )}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='copyrightText'
            render={({ field }) => (
              <FormItem className='sm:col-span-2'>
                <FormLabel>
                  {t('whiteLabels.show.copyright', 'Copyright Text')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'whiteLabels.form.copyrightPlaceholder',
                      'e.g., © 2026 Visel Art. All rights reserved.'
                    )}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>
            {t('whiteLabels.show.uploadedMediaAssets', 'Media & Logo Assets')}
          </CardTitle>
          <CardDescription>
            {t(
              'whiteLabels.show.uploadedMediaAssetsDesc',
              'Upload custom logos and icons (PNG, WebP, SVG, ICO max 5MB).'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <WhiteLabelAssetField
            form={form}
            name='site_logo'
            removeName='remove_site_logo'
            label={t('whiteLabels.form.lightLogo', 'Light Mode Logo')}
            description={t(
              'whiteLabels.form.lightLogoDesc',
              'Used in sidebar and light themes'
            )}
            previewUrl={initialData?.siteLogo}
          />
          <WhiteLabelAssetField
            form={form}
            name='site_dark_logo'
            removeName='remove_site_dark_logo'
            label={t('whiteLabels.form.darkLogo', 'Dark Mode Logo')}
            description={t(
              'whiteLabels.form.darkLogoDesc',
              'Used in dark mode themes'
            )}
            previewUrl={initialData?.siteDarkLogo}
          />
          <WhiteLabelAssetField
            form={form}
            name='site_favicon'
            removeName='remove_site_favicon'
            label={t('whiteLabels.form.favicon', 'Favicon Icon')}
            description={t(
              'whiteLabels.form.faviconDesc',
              'Browser tab icon (PNG or ICO)'
            )}
            previewUrl={initialData?.siteFavicon}
          />
        </CardContent>
      </Card>
    </div>
  )
}
