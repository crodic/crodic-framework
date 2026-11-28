import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import http from '@/lib/http'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { Button } from '@/components/ui/button'
import { DeleteAlertDialog } from './delete-alert-dialog'

/** Permanent deletion is available from trash with an explicit confirmation. */
export function HardDeleteAccountButton({
  id,
  subject,
  iconOnly = false,
  onDeleted,
}: {
  id: string
  subject: 'USER' | 'ADMIN'
  iconOnly?: boolean
  onDeleted?: () => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ability = useAuthStore((state) => state.ability)
  const actorId = useAuthStore((state) => state.id)
  const client = useQueryClient()
  const isAdmin = subject === 'ADMIN'
  const prefix = isAdmin ? 'adminUsers' : 'users'
  const mutation = useMutation({
    mutationFn: () =>
      http.delete(`/${isAdmin ? 'admin-users' : 'users'}/${id}/permanent`),
    onSuccess: async () => {
      setOpen(false)
      await client.invalidateQueries({
        queryKey: [isAdmin ? 'admins' : 'users'],
      })
      client.removeQueries({ queryKey: [isAdmin ? 'admin' : 'user', id] })
      toast.success(t(`${prefix}.messages.hardDeleteSuccess`))
      onDeleted?.()
    },
    onError: restApiErrorHandler,
  })
  if (
    !ability.can('delete', subject) ||
    (isAdmin && String(actorId) === String(id))
  )
    return null
  return (
    <>
      <Button
        type='button'
        variant={iconOnly ? 'ghost' : 'destructive'}
        size={iconOnly ? 'icon' : 'default'}
        className={iconOnly ? 'text-destructive size-8' : undefined}
        aria-label={t(`${prefix}.actions.hardDelete`)}
        disabled={mutation.isPending}
        onClick={() => setOpen(true)}
      >
        <Trash2 className='size-4' aria-hidden='true' />
        {!iconOnly && t(`${prefix}.actions.hardDelete`)}
      </Button>
      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        handleDelete={() => mutation.mutate()}
        isLoading={mutation.isPending}
        title={`${prefix}.deleteDialog.hardTitle`}
        description={`${prefix}.deleteDialog.hardDesc`}
        confirmText={`${prefix}.deleteDialog.hardConfirm`}
      />
    </>
  )
}
