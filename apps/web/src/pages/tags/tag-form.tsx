import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeftIcon,
  LanguagesIcon,
  PlusIcon,
  SaveIcon,
  SparklesIcon,
  TrashIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  TAG_LOCALES,
  tagFormSchema,
  type TagDetail,
  type TagFormValues,
} from './schema'

interface TagFormProps {
  initialData?: TagDetail
  isSubmitting?: boolean
  onSubmit: (values: TagFormValues) => void
}

function buildDefaultTranslations(initialData?: TagDetail) {
  return TAG_LOCALES.map((loc) => {
    const matched = initialData?.translations?.find(
      (item) => item.locale === loc.value
    )
    return {
      locale: loc.value,
      translatedName: matched?.translatedName ?? '',
      shortSummary: matched?.shortSummary ?? '',
    }
  })
}

export function TagForm({
  initialData,
  isSubmitting = false,
  onSubmit,
}: TagFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      category: initialData?.category ?? 'general',
      safetyRating: initialData?.safetyRating ?? 'safe',
      status: initialData?.status ?? 'active',
      isOfficial: initialData?.isOfficial ?? false,
      isSystem: initialData?.isSystem ?? false,
      translations: buildDefaultTranslations(initialData),
      aliases:
        initialData?.aliases?.map((al) => ({
          aliasName: al.aliasName,
          aliasType: al.aliasType,
          locale: al.locale ?? '',
        })) ?? [],
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        slug: initialData.slug,
        category: initialData.category,
        safetyRating: initialData.safetyRating,
        status: initialData.status,
        isOfficial: initialData.isOfficial,
        isSystem: initialData.isSystem,
        translations: buildDefaultTranslations(initialData),
        aliases:
          initialData.aliases?.map((al) => ({
            aliasName: al.aliasName,
            aliasType: al.aliasType,
            locale: al.locale ?? '',
          })) ?? [],
      })
    }
  }, [form, initialData])

  const {
    fields: aliasFields,
    append: appendAlias,
    remove: removeAlias,
  } = useFieldArray({
    control: form.control,
    name: 'aliases',
  })

  const watchedTranslations = useWatch({
    control: form.control,
    name: 'translations',
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-6'
      >
        <div className='flex flex-wrap items-center justify-between gap-3 border-b pb-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-balance'>
              {initialData
                ? t('tags.form.editTitle', 'Edit Canonical Tag')
                : t('tags.form.createTitle', 'Create Canonical Tag')}
            </h1>
            <p className='text-muted-foreground text-sm text-pretty'>
              {t(
                'tags.form.canonicalDesc',
                'Define the primary canonical tag name, category, safety rating, and governance flags.'
              )}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className='size-4' aria-hidden='true' />
              {t('buttons.back', 'Back')}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              <SaveIcon className='size-4' aria-hidden='true' />
              {isSubmitting
                ? 'Saving...'
                : t('buttons.save', 'Save Canonical Tag')}
            </Button>
          </div>
        </div>

        <div className='grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]'>
          {/* Left Column: Canonical Identity */}
          <div className='flex flex-col gap-6'>
            <Card className='shadow-xs'>
              <CardHeader>
                <CardTitle className='text-base'>
                  {t('tags.form.canonicalSection', 'Canonical Identity')}
                </CardTitle>
                <CardDescription>
                  Unicode NFKC normalization and slug generation are applied
                  automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('tags.form.name', 'Canonical Name')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t(
                            'tags.form.namePlaceholder',
                            'e.g. Cyberpunk, 葬送のフリーレン, Phong cảnh'
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('tags.form.slug', 'Custom Slug (Optional)')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t(
                            'tags.form.slugPlaceholder',
                            'Auto-generated from canonical name if empty'
                          )}
                          className='font-mono text-xs'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 items-start gap-4 sm:grid-cols-3 xl:grid-cols-1'>
                  <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('tags.form.category', 'Semantic Category')}
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='general'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-sky-500'
                                aria-hidden='true'
                              />
                              {t('tags.category.general', 'General')}
                            </SelectItem>
                            <SelectItem value='copyright'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-fuchsia-500'
                                aria-hidden='true'
                              />
                              {t(
                                'tags.category.copyright',
                                'Copyright / Series'
                              )}
                            </SelectItem>
                            <SelectItem value='character'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-emerald-500'
                                aria-hidden='true'
                              />
                              {t('tags.category.character', 'Character')}
                            </SelectItem>
                            <SelectItem value='artist'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-amber-500'
                                aria-hidden='true'
                              />
                              {t('tags.category.artist', 'Artist / Creator')}
                            </SelectItem>
                            <SelectItem value='meta'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-slate-500'
                                aria-hidden='true'
                              />
                              {t('tags.category.meta', 'Meta / Technique')}
                            </SelectItem>
                            <SelectItem value='system'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-indigo-500'
                                aria-hidden='true'
                              />
                              {t('tags.category.system', 'System')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='safetyRating'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('tags.form.safetyRating', 'Safety Rating')}
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='safe'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-emerald-500'
                                aria-hidden='true'
                              />
                              {t('tags.safety.safe', 'Safe')}
                            </SelectItem>
                            <SelectItem value='sensitive'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-amber-500'
                                aria-hidden='true'
                              />
                              {t('tags.safety.sensitive', 'Sensitive')}
                            </SelectItem>
                            <SelectItem value='r18'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-rose-500'
                                aria-hidden='true'
                              />
                              {t('tags.safety.r18', 'R-18')}
                            </SelectItem>
                            <SelectItem value='r18g'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-red-700'
                                aria-hidden='true'
                              />
                              {t('tags.safety.r18g', 'R-18G')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('tags.form.status', 'Lifecycle Status')}
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='active'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-emerald-500'
                                aria-hidden='true'
                              />
                              {t('tags.status.active', 'Active')}
                            </SelectItem>
                            <SelectItem value='pending'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-amber-500'
                                aria-hidden='true'
                              />
                              {t('tags.status.pending', 'Pending')}
                            </SelectItem>
                            <SelectItem value='banned'>
                              <span
                                className='bg-destructive size-2 shrink-0 rounded-full'
                                aria-hidden='true'
                              />
                              {t('tags.status.banned', 'Banned')}
                            </SelectItem>
                            <SelectItem value='merged'>
                              <span
                                className='size-2 shrink-0 rounded-full bg-purple-500'
                                aria-hidden='true'
                              />
                              {t('tags.status.merged', 'Merged')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='isOfficial'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between gap-3 rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-sm'>
                          {t('tags.form.isOfficial', 'Official Verified Tag')}
                        </FormLabel>
                        <FormDescription className='text-xs'>
                          {t(
                            'tags.form.isOfficialDesc',
                            'Marks this tag as curated by platform moderators.'
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
                  name='isSystem'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between gap-3 rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-sm'>
                          {t('tags.form.isSystem', 'System Tag')}
                        </FormLabel>
                        <FormDescription className='text-xs'>
                          {t(
                            'tags.form.isSystemDesc',
                            'Prevents community deletion and merges.'
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Translations + Orthographic Aliases */}
          <div className='flex flex-col gap-6'>
            <Card className='shadow-xs'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <LanguagesIcon
                    className='text-primary size-4'
                    aria-hidden='true'
                  />
                  {t(
                    'tags.form.translationsSection',
                    'Multilingual Translations'
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    'tags.form.translationsDesc',
                    'Provide localized display names and concise hover summaries across supported languages.'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {TAG_LOCALES.map((localeItem, idx) => {
                  const currentName =
                    watchedTranslations?.[idx]?.translatedName?.trim() ?? ''
                  const currentSummary =
                    watchedTranslations?.[idx]?.shortSummary ?? ''
                  const isConfigured = Boolean(
                    currentName || currentSummary.trim()
                  )
                  return (
                    <div
                      key={localeItem.value}
                      className='bg-muted/20 space-y-3.5 rounded-xl border p-4'
                    >
                      <div className='flex items-center justify-between border-b pb-2.5'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='outline'
                            className='bg-background font-mono text-xs uppercase'
                          >
                            {localeItem.value}
                          </Badge>
                          <span className='text-sm font-medium'>
                            {localeItem.label}
                          </span>
                        </div>
                        <span className='text-muted-foreground inline-flex items-center gap-1.5 text-xs'>
                          <span
                            className={`size-1.5 rounded-full ${
                              isConfigured
                                ? 'bg-emerald-500'
                                : 'bg-muted-foreground/40'
                            }`}
                            aria-hidden='true'
                          />
                          {isConfigured
                            ? t('tags.form.configured', 'Configured')
                            : t('tags.form.notSet', 'Optional')}
                        </span>
                      </div>

                      <div className='space-y-3'>
                        <FormField
                          control={form.control}
                          name={`translations.${idx}.translatedName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-xs'>
                                {t(
                                  'tags.form.displayName',
                                  'Translated Display Name'
                                )}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={`Display name in ${localeItem.label}...`}
                                  className='bg-background'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`translations.${idx}.shortSummary`}
                          render={({ field }) => (
                            <FormItem>
                              <div className='flex items-center justify-between gap-2'>
                                <FormLabel className='text-xs'>
                                  {t(
                                    'tags.form.shortSummary',
                                    'Hover Tooltip Summary'
                                  )}
                                </FormLabel>
                                <span
                                  role='status'
                                  aria-atomic='true'
                                  className='text-muted-foreground font-mono text-[11px] tabular-nums'
                                >
                                  {currentSummary.length} / 280
                                </span>
                              </div>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={2}
                                  placeholder='Concise encyclopedia preview shown on hover...'
                                  className='bg-background min-h-16 resize-none'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className='shadow-xs'>
              <CardHeader className='flex flex-row items-start justify-between gap-3'>
                <div className='space-y-1'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <SparklesIcon
                      className='text-primary size-4'
                      aria-hidden='true'
                    />
                    {t(
                      'tags.form.aliasesSection',
                      'Orthographic Aliases (表記揺れ)'
                    )}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'tags.form.aliasesDesc',
                      'Map synonyms, abbreviations, and common typos to automatically resolve and 301-redirect to this canonical tag.'
                    )}
                  </CardDescription>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    appendAlias({
                      aliasName: '',
                      aliasType: 'synonym',
                      locale: '',
                    })
                  }
                >
                  <PlusIcon className='size-4' aria-hidden='true' />
                  {t('tags.form.addAlias', 'Add Alias')}
                </Button>
              </CardHeader>
              <CardContent>
                {aliasFields.length === 0 ? (
                  <div className='text-muted-foreground rounded-lg border border-dashed p-6 text-center text-xs'>
                    No orthographic aliases configured yet. Add abbreviations
                    (e.g. &ldquo;FGO&rdquo;), romanizations, or common typos so
                    search and autocomplete resolve directly to this tag.
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {aliasFields.map((aliasField, idx) => (
                      <div
                        key={aliasField.id}
                        className='grid items-start gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_160px_110px_40px]'
                      >
                        <FormField
                          control={form.control}
                          name={`aliases.${idx}.aliasName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='sr-only'>
                                {t('tags.form.aliasName', 'Alias Keyword')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Alias keyword (e.g. FGO, フリーレン)...'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`aliases.${idx}.aliasType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='sr-only'>
                                {t('tags.form.aliasType', 'Alias Type')}
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className='w-full'>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value='synonym'>
                                    Synonym
                                  </SelectItem>
                                  <SelectItem value='abbreviation'>
                                    Abbreviation
                                  </SelectItem>
                                  <SelectItem value='typo'>
                                    Typo / Variant
                                  </SelectItem>
                                  <SelectItem value='legacy_merge'>
                                    Legacy Merge
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`aliases.${idx}.locale`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='sr-only'>
                                {t('tags.form.aliasLocale', 'Locale')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Locale (all)'
                                  className='font-mono text-xs'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='text-destructive hover:text-destructive size-9'
                          aria-label={`Remove alias ${idx + 1}`}
                          onClick={() => removeAlias(idx)}
                        >
                          <TrashIcon className='size-4' aria-hidden='true' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
