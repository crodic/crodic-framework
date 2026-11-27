import { Children, Fragment, isValidElement, type ReactNode } from 'react'
import { Eye, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export interface TableRowActionProps {
  label: ReactNode
  icon?: ReactNode
  to?: string
  onSelect?: () => void
  disabled?: boolean
  destructive?: boolean
  hidden?: boolean
}

/** Declarative action, rendered by TableRowActions according to the visible action count. */
export function TableRowAction(_props: TableRowActionProps) {
  return null
}

function labelText(label: ReactNode): string {
  if (typeof label === 'string' || typeof label === 'number')
    return String(label)
  if (isValidElement<{ children?: ReactNode }>(label))
    return labelText(label.props.children)
  return Children.toArray(label)
    .map((child) =>
      typeof child === 'object' &&
      isValidElement<{ children?: ReactNode }>(child)
        ? labelText(child.props.children)
        : String(child)
    )
    .join(' ')
}

/** Up to four actions stay visible as icons; five or more use a menu. */
export function TableRowActions({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const actions: TableRowActionProps[] = []
  const companions: ReactNode[] = []
  const collect = (nodes: ReactNode) =>
    Children.forEach(nodes, (child) => {
      if (
        isValidElement<{ children?: ReactNode }>(child) &&
        child.type === Fragment
      )
        collect(child.props.children)
      else if (
        isValidElement<TableRowActionProps>(child) &&
        child.type === TableRowAction
      ) {
        if (!child.props.hidden) actions.push(child.props)
      } else if (child) companions.push(child)
    })
  collect(children)
  return (
    <div
      className='flex w-fit items-center justify-start gap-1'
      onClick={(event) => event.stopPropagation()}
    >
      {companions}
      {actions.length > 4 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8'
              aria-label={t('rowActions.more', 'Actions')}
            >
              <MoreHorizontal className='size-4' aria-hidden='true' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-44'>
            {actions.map((action, index) => (
              <Fragment key={index}>
                {action.destructive &&
                  index > 0 &&
                  !actions[index - 1].destructive && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  disabled={action.disabled}
                  onClick={action.onSelect}
                  asChild={Boolean(action.to && !action.disabled)}
                  className={cn(
                    'gap-2 [&_svg]:size-4',
                    action.destructive &&
                      'text-destructive focus:text-destructive'
                  )}
                >
                  {action.to && !action.disabled ? (
                    <Link to={action.to}>
                      <span aria-hidden='true'>
                        {action.icon ?? <Eye className='size-4' />}
                      </span>
                      {action.label}
                    </Link>
                  ) : (
                    <>
                      <span aria-hidden='true'>
                        {action.icon ?? <Eye className='size-4' />}
                      </span>
                      {action.label}
                    </>
                  )}
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        actions.map((action, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <span
                className='inline-flex'
                tabIndex={action.disabled ? 0 : undefined}
              >
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className={cn(
                    'size-8 [&_svg]:size-4',
                    action.destructive &&
                      'text-destructive hover:text-destructive'
                  )}
                  disabled={action.disabled}
                  aria-label={labelText(action.label)}
                  onClick={action.onSelect}
                  asChild={Boolean(action.to && !action.disabled)}
                >
                  {action.to && !action.disabled ? (
                    <Link to={action.to}>
                      <span aria-hidden='true'>
                        {action.icon ?? <Eye className='size-4' />}
                      </span>
                    </Link>
                  ) : (
                    <span aria-hidden='true'>
                      {action.icon ?? <Eye className='size-4' />}
                    </span>
                  )}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        ))
      )}
    </div>
  )
}
