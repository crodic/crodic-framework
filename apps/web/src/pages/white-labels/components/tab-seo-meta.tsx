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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { WhiteLabelFormSchema, WhiteLabelSchema } from '../schema'
import { WhiteLabelAssetField } from './white-label-asset-field'

type TabSeoMetaProps = {
  form: UseFormReturn<WhiteLabelFormSchema>
  initialData?: WhiteLabelSchema | null
}

export function TabSeoMeta({ form, initialData }: TabSeoMetaProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          {t('whiteLabels.form.seoTitle', 'Search Engine Optimization (SEO)')}
        </CardTitle>
        <CardDescription>
          {t(
            'whiteLabels.form.seoDesc',
            'Custom meta tags for browser title, search engine snippets, and social cards.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='metaTitle'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('whiteLabels.form.metaTitle', 'Meta Title')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'whiteLabels.form.metaTitlePlaceholder',
                      'e.g., Kosume - Modern Admin'
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
            name='canonicalUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('whiteLabels.form.canonicalUrl', 'Canonical URL')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'whiteLabels.form.canonicalUrlPlaceholder',
                      'e.g., https://admin.viselart.com'
                    )}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='metaDescription'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('whiteLabels.form.metaDescription', 'Meta Description')}
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder={t(
                    'whiteLabels.form.metaDescriptionPlaceholder',
                    'Search engine summary snippet...'
                  )}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 pt-2 sm:grid-cols-2'>
          <WhiteLabelAssetField
            form={form}
            name='og_image'
            removeName='remove_og_image'
            label={t('whiteLabels.form.ogImage', 'OpenGraph Image')}
            description={t(
              'whiteLabels.form.ogImageDesc',
              'Social media share card preview'
            )}
            previewUrl={initialData?.ogImage}
          />
          <WhiteLabelAssetField
            form={form}
            name='twitter_image'
            removeName='remove_twitter_image'
            label={t('whiteLabels.form.twitterImage', 'Twitter Card Image')}
            description={t(
              'whiteLabels.form.twitterImageDesc',
              'Twitter/X summary card preview'
            )}
            previewUrl={initialData?.twitterImage}
          />
        </div>
      </CardContent>
    </Card>
  )
}
