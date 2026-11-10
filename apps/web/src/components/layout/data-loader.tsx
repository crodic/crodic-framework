import { Loader2 } from 'lucide-react'
import { Main } from './main'

export default function DataLoader() {
  return (
    <Main className='flex flex-1 items-center justify-center py-16'>
      <Loader2 className='text-muted-foreground size-8 animate-spin' />
    </Main>
  )
}
