import { useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface EmailPreviewProps {
  html: string
}

export function EmailPreview({ html }: EmailPreviewProps) {
  const { t } = useTranslation()
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState('preview')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <TabsList className='grid w-full grid-cols-2 sm:w-auto'>
          <TabsTrigger value='preview'>
            {t('emailLogs.show.preview')}
          </TabsTrigger>
          <TabsTrigger value='source'>
            {t('emailLogs.show.sourceCode')}
          </TabsTrigger>
        </TabsList>

        {activeTab === 'preview' && (
          <div className='bg-muted/50 border-border/60 inline-flex items-center gap-1 self-end rounded-lg border p-1 sm:self-auto'>
            <Button
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-8 px-3 text-xs font-medium'
              onClick={() => setDevice('desktop')}
            >
              <Monitor size={15} className='mr-1.5' />
              Desktop
            </Button>
            <Button
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-8 px-3 text-xs font-medium'
              onClick={() => setDevice('mobile')}
            >
              <Smartphone size={15} className='mr-1.5' />
              Mobile
            </Button>
          </div>
        )}
      </div>

      <TabsContent value='preview' className='mt-0'>
        <div className='bg-muted/30 flex min-h-[500px] justify-center overflow-hidden rounded-md border p-2 sm:p-4'>
          <div
            className={`h-[600px] max-w-full overflow-hidden rounded border bg-white shadow-sm transition-[width] duration-200 ease-out ${
              device === 'mobile' ? 'w-[375px]' : 'w-full'
            }`}
          >
            <iframe
              title='Email Preview'
              srcDoc={html}
              className='size-full border-0'
              sandbox='allow-same-origin'
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value='source' className='mt-0'>
        <div className='bg-muted/50 max-h-150 min-h-125 overflow-auto rounded-md border p-3 sm:p-4'>
          <pre className='text-foreground/80 font-mono text-xs break-all whitespace-pre-wrap sm:text-sm'>
            {html}
          </pre>
        </div>
      </TabsContent>
    </Tabs>
  )
}
