import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useBreadcrumbStore } from '@/stores/breadcrumb-store'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function AppBreadcrumb() {
  const { t } = useTranslation()
  const items = useBreadcrumbStore((state) => state.items)

  return (
    <Breadcrumb className='hidden md:flex'>
      <BreadcrumbList>
        <BreadcrumbItem>
          {items.length === 0 ? (
            <BreadcrumbPage>
              {t('navigation.general.dashboard', 'Dashboard')}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to='/'>
                {t('navigation.general.dashboard', 'Dashboard')}
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isClickable = !isLast && Boolean(item.href)

          return (
            <span
              key={item.href ?? `crumb-${index}`}
              className='inline-flex items-center gap-1.5 sm:gap-2.5'
            >
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isClickable ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href!}>{item.title}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className='font-medium'>
                    {item.title}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
