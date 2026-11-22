import { useEffect, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  CheckIcon,
  CopyIcon,
  EyeIcon,
  GlobeIcon,
  HashIcon,
  LanguagesIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  ShieldCheckIcon,
  Wand2Icon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
import { FormFieldHelp } from './components/form-field-help'
import {
  TagCategoryBadge,
  TagNodeChip,
  TagSafetyBadge,
  TagStatusBadge,
} from './components/tag-badges'
import {
  TAG_LOCALES,
  tagFormSchema,
  type TagAliasType,
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

  const [activeLocale, setActiveLocale] = useState<string>('en')
  const [quickAliasName, setQuickAliasName] = useState('')
  const [quickAliasType, setQuickAliasType] = useState<TagAliasType>('synonym')
  const [copiedSlug, setCopiedSlug] = useState(false)

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

  const watchedName = useWatch({ control: form.control, name: 'name' })
  const watchedCategory = useWatch({ control: form.control, name: 'category' })
  const watchedSafety = useWatch({
    control: form.control,
    name: 'safetyRating',
  })
  const watchedStatus = useWatch({ control: form.control, name: 'status' })
  const watchedIsOfficial = useWatch({
    control: form.control,
    name: 'isOfficial',
  })
  const watchedIsSystem = useWatch({ control: form.control, name: 'isSystem' })
  const watchedTranslations = useWatch({
    control: form.control,
    name: 'translations',
  })

  const handleGenerateSlug = () => {
    const currentName = form.getValues('name')
    if (!currentName?.trim()) {
      toast.error(
        t(
          'tags.form.nameRequiredForSlug',
          'Please enter a canonical name first'
        )
      )
      return
    }
    const generated = currentName
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (generated) {
      form.setValue('slug', generated, {
        shouldValidate: true,
        shouldDirty: true,
      })
      toast.success(
        t('tags.form.slugGenerated', 'Slug generated from canonical name')
      )
    }
  }

  const handleCopySlug = () => {
    const currentSlug = form.getValues('slug')
    if (!currentSlug) return
    navigator.clipboard.writeText(currentSlug)
    setCopiedSlug(true)
    setTimeout(() => setCopiedSlug(false), 1500)
    toast.success(t('tags.actions.copied', 'Copied to clipboard'))
  }

  const handleQuickAddAlias = () => {
    const trimmed = quickAliasName.trim()
    if (!trimmed) return

    const existing = form.getValues('aliases') || []
    if (
      existing.some(
        (al) => al.aliasName.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      toast.error(
        t('tags.form.aliasExists', 'Alias already exists in the list')
      )
      return
    }

    appendAlias({
      aliasName: trimmed,
      aliasType: quickAliasType,
      locale: '',
    })
    setQuickAliasName('')
  }

  const activeLocaleIndex = TAG_LOCALES.findIndex(
    (loc) => loc.value === activeLocale
  )
  const activeLocaleItem =
    activeLocaleIndex >= 0 ? TAG_LOCALES[activeLocaleIndex] : TAG_LOCALES[0]

  const activeTranslation =
    watchedTranslations?.[activeLocaleIndex]?.translatedName || ''

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-1 flex-col gap-6'
      >
        {/* Sticky Header Action Bar */}
        <div className='bg-card/95 border-border/80 sticky top-0 z-30 rounded-2xl border p-4 shadow-sm backdrop-blur-md sm:p-5'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-3 sm:items-center'>
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => navigate(-1)}
                className='mt-0.5 size-9 shrink-0 cursor-pointer shadow-2xs sm:mt-0'
                aria-label={t('buttons.back', 'Back')}
              >
                <ArrowLeftIcon className='size-4' aria-hidden='true' />
              </Button>

              <div className='space-y-0.5'>
                <div className='flex flex-wrap items-center gap-2.5'>
                  <h1 className='text-foreground text-xl font-bold tracking-tight sm:text-2xl'>
                    {initialData
                      ? `#${watchedName || initialData.name}`
                      : t('tags.form.createTitle', 'Create Canonical Tag')}
                  </h1>
                  <TagStatusBadge status={watchedStatus} />
                  <TagCategoryBadge category={watchedCategory} />
                </div>
                <p className='text-muted-foreground text-xs'>
                  {initialData
                    ? t(
                        'tags.form.editSubtitle',
                        'Configure canonical identity, multilingual localizations, and aliases.'
                      )
                    : t(
                        'tags.form.createSubtitle',
                        'Register a new canonical tag into the platform taxonomy.'
                      )}
                </p>
              </div>
            </div>

            <div className='flex w-full items-center justify-end gap-2 sm:w-auto'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className='w-full cursor-pointer text-xs sm:w-auto'
              >
                {t('buttons.cancel', 'Cancel')}
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full cursor-pointer gap-2 shadow-xs sm:w-auto'
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon
                      className='size-4 animate-spin'
                      aria-hidden='true'
                    />
                    <span>{t('buttons.saving', 'Saving...')}</span>
                  </>
                ) : (
                  <>
                    <SaveIcon className='size-4' aria-hidden='true' />
                    <span>
                      {initialData
                        ? t('buttons.saveChanges', 'Save Changes')
                        : t('buttons.createTag', 'Create Tag')}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Live Taxonomy Preview Strip */}
        <Card className='border-border/70 bg-muted/20 relative overflow-hidden shadow-2xs'>
          <CardContent className='flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg'>
                <EyeIcon className='size-4' aria-hidden='true' />
              </div>
              <div>
                <p className='text-foreground text-xs font-semibold'>
                  {t('tags.form.previewBadge', 'Live Taxonomy Preview')}
                </p>
                <p className='text-muted-foreground text-[11px]'>
                  {t(
                    'tags.form.previewDesc',
                    'Real-time preview of badge styling, category accent, and localization chip.'
                  )}
                </p>
              </div>
            </div>

            {/* Visual Chip Representation */}
            <div className='flex flex-wrap items-center gap-2.5'>
              <TagNodeChip
                name={watchedName?.trim() || 'example-tag'}
                translatedName={activeTranslation}
                category={watchedCategory}
                isOfficial={watchedIsOfficial}
                isSystem={watchedIsSystem}
                usageCount={initialData?.usageCount ?? 0}
              />
              <TagSafetyBadge safetyRating={watchedSafety} />
            </div>
          </CardContent>
        </Card>

        {/* 2-Column Responsive Workspace Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Main Column (8 Cols): Canonical Identity + Multilingual Studio */}
          <div className='space-y-6 lg:col-span-8'>
            {/* Card 1: Core Canonical Identity */}
            <Card className='border-border/80 shadow-2xs'>
              <CardHeader className='border-b px-5 py-4 sm:px-6'>
                <div className='flex items-center gap-2.5'>
                  <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
                    <HashIcon className='size-4.5' aria-hidden='true' />
                  </div>
                  <div>
                    <CardTitle className='text-base font-semibold'>
                      {t('tags.form.canonicalSection', 'Canonical Identity')}
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      {t(
                        'tags.form.canonicalDesc',
                        'Define the primary canonical tag name, category, safety rating, and governance flags.'
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-5 p-5 sm:p-6'>
                {/* Row 1: Canonical Name & Permastyle Slug */}
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-1.5'>
                            <FormLabel className='text-xs font-semibold'>
                              {t('tags.form.name', 'Canonical Name')}
                            </FormLabel>
                            <FormFieldHelp tooltip={t('tags.help.name')} />
                          </div>
                          <span className='text-muted-foreground font-mono text-[10px]'>
                            {t('tags.form.required', 'Required')}
                          </span>
                        </div>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <span className='text-primary pointer-events-none absolute left-3 font-mono text-sm font-semibold'>
                              #
                            </span>
                            <Input
                              {...field}
                              placeholder={t(
                                'tags.form.namePlaceholder',
                                'e.g. Cyberpunk, 葬送のフリーレン, Landscape'
                              )}
                              className='text-foreground pl-8 font-semibold tracking-tight'
                            />
                          </div>
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
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-1.5'>
                            <FormLabel className='text-xs font-semibold'>
                              {t('tags.form.slug', 'Custom Slug (Optional)')}
                            </FormLabel>
                            <FormFieldHelp tooltip={t('tags.help.slug')} />
                          </div>
                          <button
                            type='button'
                            onClick={handleGenerateSlug}
                            className='text-primary inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium hover:underline'
                          >
                            <RefreshCwIcon
                              className='size-3'
                              aria-hidden='true'
                            />
                            {t('tags.form.syncSlug', 'Auto-Slug')}
                          </button>
                        </div>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <span className='text-muted-foreground pointer-events-none absolute left-3 font-mono text-xs'>
                              /
                            </span>
                            <Input
                              {...field}
                              placeholder={t(
                                'tags.form.slugPlaceholder',
                                'Auto-generated from canonical name if empty'
                              )}
                              className='pr-8 pl-6 font-mono text-xs'
                            />
                            {field.value && (
                              <button
                                type='button'
                                onClick={handleCopySlug}
                                aria-label={t(
                                  'tags.actions.copySlug',
                                  'Copy slug'
                                )}
                                className='text-muted-foreground hover:text-foreground absolute right-2.5 cursor-pointer'
                              >
                                {copiedSlug ? (
                                  <CheckIcon
                                    className='size-3.5 text-emerald-500'
                                    aria-hidden='true'
                                  />
                                ) : (
                                  <CopyIcon
                                    className='size-3.5'
                                    aria-hidden='true'
                                  />
                                )}
                              </button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: Category, Safety Rating, Lifecycle Status */}
                <div className='grid gap-4 sm:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className='flex items-center gap-1.5'>
                            <FormLabel className='text-xs font-semibold'>
                              {t('tags.form.category', 'Semantic Category')}
                            </FormLabel>
                            <FormFieldHelp tooltip={t('tags.help.category')} />
                          </div>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full text-xs font-medium'>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='general'>
                                <div className='flex items-center gap-2'>
                                  <span
                                    className='size-2 rounded-full bg-sky-500'
                                    aria-hidden='true'
                                  />
                                  <span>
                                    {t('tags.category.general', 'General')}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value='copyright'>
                                <div className='flex items-center gap-2'>
                                  <span
                                    className='size-2 rounded-full bg-violet-600'
                                    aria-hidden='true'
                                  />
                                  <span>
                                    {t(
                                      'tags.category.copyright',
                                      'Copyright / Series'
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value='character'>
                                <div className='flex items-center gap-2'>
                                  <span
                                    className='size-2 rounded-full bg-emerald-600'
                                    aria-hidden='true'
                                  />
                                  <span>
                                    {t('tags.category.character', 'Character')}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value='artist'>
                                <div className='flex items-center gap-2'>
                                  <span
                                    className='size-2 rounded-full bg-amber-600'
                                    aria-hidden='true'
                                  />
                                  <span>
                                    {t(
                                      'tags.category.artist',
                                      'Artist / Creator'
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value='meta'>
                                <div className='flex items-center gap-2'>
                                  <span
                                    className='size-2 rounded-full bg-indigo-600'
                                    aria-hidden='true'
                                  />
                                  <span>
                                    {t(
                                      'tags.category.meta',
                                      'Meta / Technique'
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value='system'>
                                <div className='flex items-center gap-2'>
                                  <span
                                    className='size-2 rounded-full bg-rose-600'
                                    aria-hidden='true'
                                  />
                                  <span>
                                    {t('tags.category.system', 'System')}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name='safetyRating'
                    render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center gap-1.5'>
                          <FormLabel className='text-xs font-semibold'>
                            {t('tags.form.safetyRating', 'Safety Rating')}
                          </FormLabel>
                          <FormFieldHelp
                            tooltip={t('tags.help.safetyRating')}
                          />
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full text-xs font-medium'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='safe'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className='size-2 rounded-full bg-emerald-500'
                                  aria-hidden='true'
                                />
                                <span>{t('tags.safety.safe', 'Safe')}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value='sensitive'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className='size-2 rounded-full bg-amber-500'
                                  aria-hidden='true'
                                />
                                <span>
                                  {t('tags.safety.sensitive', 'Sensitive')}
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value='r18'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className='size-2 rounded-full bg-rose-500'
                                  aria-hidden='true'
                                />
                                <span>{t('tags.safety.r18', 'R-18')}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value='r18g'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className='size-2 rounded-full bg-red-700'
                                  aria-hidden='true'
                                />
                                <span>{t('tags.safety.r18g', 'R-18G')}</span>
                              </div>
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
                        <div className='flex items-center gap-1.5'>
                          <FormLabel className='text-xs font-semibold'>
                            {t('tags.form.status', 'Lifecycle Status')}
                          </FormLabel>
                          <FormFieldHelp tooltip={t('tags.help.status')} />
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full text-xs font-medium'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='active'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className='size-2 rounded-full bg-emerald-500'
                                  aria-hidden='true'
                                />
                                <span>{t('tags.status.active', 'Active')}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value='pending'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className='size-2 rounded-full bg-amber-500'
                                  aria-hidden='true'
                                />
                                <span>
                                  {t('tags.status.pending', 'Pending')}
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value='banned'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className='size-2 rounded-full bg-rose-500'
                                  aria-hidden='true'
                                />
                                <span>{t('tags.status.banned', 'Banned')}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value='merged'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className='size-2 rounded-full bg-violet-500'
                                  aria-hidden='true'
                                />
                                <span>{t('tags.status.merged', 'Merged')}</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Multilingual Translations Studio */}
            <Card className='border-border/80 shadow-2xs'>
              <CardHeader className='border-b px-5 py-4 sm:px-6'>
                <div className='flex items-center gap-2.5'>
                  <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
                    <LanguagesIcon className='size-4.5' aria-hidden='true' />
                  </div>
                  <div>
                    <CardTitle className='text-base font-semibold'>
                      {t(
                        'tags.form.translationsSection',
                        'Multilingual Translations'
                      )}
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      {t(
                        'tags.form.translationsDesc',
                        'Provide localized display names and concise hover summaries across supported languages.'
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-5 p-5 sm:p-6'>
                {/* Language Selection Tabs Bar */}
                <div className='border-border/70 bg-muted/30 flex flex-col gap-2.5 rounded-xl border p-2 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-2 pl-1'>
                    <GlobeIcon
                      className='text-primary size-4 shrink-0'
                      aria-hidden='true'
                    />
                    <span className='text-foreground text-xs font-semibold'>
                      {t('tags.form.selectLocale', 'Language:')}
                    </span>
                  </div>

                  <div className='flex w-full [scrollbar-width:none] items-center gap-1.5 overflow-x-auto py-0.5 sm:w-auto'>
                    {TAG_LOCALES.map((localeItem, idx) => {
                      const currentName =
                        watchedTranslations?.[idx]?.translatedName?.trim() ?? ''
                      const currentSummary =
                        watchedTranslations?.[idx]?.shortSummary?.trim() ?? ''
                      const isConfigured = Boolean(
                        currentName || currentSummary
                      )
                      const isActive = activeLocale === localeItem.value

                      return (
                        <button
                          key={localeItem.value}
                          type='button'
                          onClick={() => setActiveLocale(localeItem.value)}
                          className={cn(
                            'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all select-none',
                            isActive
                              ? 'bg-background text-foreground ring-border font-semibold shadow-xs ring-1'
                              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                          )}
                        >
                          <span
                            className={cn(
                              'size-1.5 shrink-0 rounded-full',
                              isConfigured
                                ? 'bg-emerald-500'
                                : 'bg-muted-foreground/40'
                            )}
                            aria-hidden='true'
                          />
                          <span className='font-medium whitespace-nowrap'>
                            {localeItem.label}
                          </span>
                          {isConfigured && (
                            <span className='font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400'>
                              ✓
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {activeLocaleIndex >= 0 && (
                  <div className='space-y-5'>
                    {/* Field 1: Translated Name */}
                    <FormField
                      control={form.control}
                      name={`translations.${activeLocaleIndex}.translatedName`}
                      render={({ field }) => (
                        <FormItem>
                          <div className='flex items-center gap-1.5'>
                            <FormLabel className='text-xs font-semibold'>
                              {t(
                                'tags.form.displayName',
                                'Translated Display Name'
                              )}
                            </FormLabel>
                            <FormFieldHelp
                              tooltip={t('tags.help.displayName')}
                            />
                          </div>
                          <FormControl>
                            <div className='relative flex items-center'>
                              <GlobeIcon
                                className='text-muted-foreground pointer-events-none absolute left-3 size-3.5'
                                aria-hidden='true'
                              />
                              <Input
                                {...field}
                                placeholder={t(
                                  'tags.form.translatedPlaceholder',
                                  {
                                    locale: activeLocaleItem.label,
                                    defaultValue: `Display name in ${activeLocaleItem.label}...`,
                                  }
                                )}
                                className='pl-8 text-xs font-medium'
                              />
                            </div>
                          </FormControl>
                          <FormDescription className='text-muted-foreground text-[11px]'>
                            {t(
                              'tags.form.translatedTip',
                              'Community members browsing in this locale see this title.'
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Field 2: Short Summary */}
                    <FormField
                      control={form.control}
                      name={`translations.${activeLocaleIndex}.shortSummary`}
                      render={({ field }) => {
                        const currentLen = (field.value ?? '').length
                        return (
                          <FormItem>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-1.5'>
                                <FormLabel className='text-xs font-semibold'>
                                  {t(
                                    'tags.form.shortSummary',
                                    'Hover Tooltip Summary'
                                  )}
                                </FormLabel>
                                <FormFieldHelp
                                  tooltip={t('tags.help.shortSummary')}
                                />
                              </div>
                              <span
                                className={cn(
                                  'font-mono text-[11px] tabular-nums',
                                  currentLen > 250
                                    ? 'font-semibold text-amber-500'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {currentLen} / 280
                              </span>
                            </div>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                placeholder={t(
                                  'tags.form.summaryPlaceholder',
                                  'Concise 1-2 sentence definition shown in artwork hover cards and autocomplete popovers...'
                                )}
                                className='resize-none text-xs leading-relaxed'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Column (4 Cols): Governance Flags & Orthographic Aliases */}
          <div className='space-y-6 lg:col-span-4'>
            {/* Card 3: Governance & Security Flags */}
            <Card className='border-border/80 shadow-2xs'>
              <CardHeader className='border-b px-5 py-4'>
                <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                  <ShieldCheckIcon
                    className='text-primary size-4'
                    aria-hidden='true'
                  />
                  <span>
                    {t(
                      'tags.form.governanceSection',
                      'Governance & Protection'
                    )}
                  </span>
                </CardTitle>
                <CardDescription className='text-xs'>
                  {t(
                    'tags.form.governanceDesc',
                    'Set access control and trust verification flags.'
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-3 p-5'>
                <FormField
                  control={form.control}
                  name='isOfficial'
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-2xs transition-all',
                        field.value
                          ? 'border-primary/50 bg-primary/5 ring-primary/20 ring-1'
                          : 'border-border/70 bg-card hover:border-border'
                      )}
                    >
                      <div className='space-y-0.5 pr-2'>
                        <div className='flex items-center gap-1.5'>
                          <BadgeCheckIcon
                            className='text-primary size-4'
                            aria-hidden='true'
                          />
                          <FormLabel className='cursor-pointer text-xs font-semibold'>
                            {t('tags.form.isOfficial', 'Official Verified Tag')}
                          </FormLabel>
                        </div>
                        <FormDescription className='text-[11px] leading-relaxed'>
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
                    <FormItem
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-2xs transition-all',
                        field.value
                          ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20'
                          : 'border-border/70 bg-card hover:border-border'
                      )}
                    >
                      <div className='space-y-0.5 pr-2'>
                        <div className='flex items-center gap-1.5'>
                          <LockIcon
                            className='size-4 text-amber-500'
                            aria-hidden='true'
                          />
                          <FormLabel className='cursor-pointer text-xs font-semibold'>
                            {t('tags.form.isSystem', 'System Tag')}
                          </FormLabel>
                        </div>
                        <FormDescription className='text-[11px] leading-relaxed'>
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

            {/* Card 4: Orthographic Aliases (表記揺れ) */}
            <Card className='border-border/80 shadow-2xs'>
              <CardHeader className='border-b px-5 py-4'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                    <Wand2Icon
                      className='text-primary size-4'
                      aria-hidden='true'
                    />
                    <span>
                      {t('tags.form.aliasesSection', 'Orthographic Aliases')}
                    </span>
                  </CardTitle>
                  <Badge
                    variant='outline'
                    className='font-mono text-[10px] tabular-nums'
                  >
                    {aliasFields.length}
                  </Badge>
                </div>
                <CardDescription className='text-xs'>
                  {t(
                    'tags.form.aliasesDesc',
                    'Map synonyms, abbreviations, and common typos to automatically resolve and 301-redirect to this canonical tag.'
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-4 p-5'>
                {/* Quick-Add Toolbar */}
                <div className='border-border/70 bg-muted/20 space-y-2 rounded-xl border p-2.5'>
                  <Input
                    value={quickAliasName}
                    onChange={(e) => setQuickAliasName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleQuickAddAlias()
                      }
                    }}
                    placeholder={t(
                      'tags.form.aliasQuickPlaceholder',
                      'Add synonym, abbreviation, or typo (e.g. FGO, Saber)...'
                    )}
                    className='bg-background h-8 text-xs'
                  />
                  <div className='flex items-center gap-2'>
                    <Select
                      value={quickAliasType}
                      onValueChange={(val) =>
                        setQuickAliasType(val as TagAliasType)
                      }
                    >
                      <SelectTrigger className='bg-background h-8 flex-1 text-xs'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='synonym'>
                          {t('tags.aliasType.synonym', 'Synonym')}
                        </SelectItem>
                        <SelectItem value='abbreviation'>
                          {t('tags.aliasType.abbreviation', 'Abbreviation')}
                        </SelectItem>
                        <SelectItem value='typo'>
                          {t('tags.aliasType.typo', 'Typo / Variant')}
                        </SelectItem>
                        <SelectItem value='legacy_merge'>
                          {t('tags.aliasType.legacyMerge', 'Legacy Merge')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type='button'
                      size='sm'
                      onClick={handleQuickAddAlias}
                      disabled={!quickAliasName.trim()}
                      className='h-8 shrink-0 cursor-pointer gap-1 px-3 text-xs font-semibold'
                    >
                      <PlusIcon className='size-3.5' aria-hidden='true' />
                      {t('buttons.add', 'Add')}
                    </Button>
                  </div>
                </div>

                {/* Active Aliases Chip Area */}
                {aliasFields.length === 0 ? (
                  <div className='border-border/70 text-muted-foreground rounded-xl border border-dashed p-5 text-center text-xs'>
                    {t(
                      'tags.form.noAliases',
                      'No orthographic aliases configured yet. Add abbreviations (e.g. "FGO"), romanizations, or common typos so search and autocomplete resolve directly to this tag.'
                    )}
                  </div>
                ) : (
                  <div className='flex flex-wrap gap-1.5'>
                    {aliasFields.map((aliasField, idx) => {
                      const val = form.watch(`aliases.${idx}`)
                      return (
                        <Badge
                          key={aliasField.id}
                          variant='secondary'
                          className='group border-border/70 bg-card hover:border-foreground/30 flex items-center gap-1.5 rounded-lg border py-1 pr-1.5 pl-2 text-xs font-normal shadow-2xs transition-colors'
                        >
                          <span className='text-foreground text-[11px] font-semibold'>
                            {val?.aliasName || `Alias #${idx + 1}`}
                          </span>
                          <span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[9px] uppercase'>
                            {val?.aliasType}
                          </span>
                          <button
                            type='button'
                            onClick={() => removeAlias(idx)}
                            className='text-muted-foreground hover:bg-destructive/15 hover:text-destructive cursor-pointer rounded p-0.5 transition-colors'
                            title={t('tags.form.removeAlias', 'Remove alias')}
                            aria-label={`Remove alias ${val?.aliasName}`}
                          >
                            <XIcon className='size-3' aria-hidden='true' />
                          </button>
                        </Badge>
                      )
                    })}
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
