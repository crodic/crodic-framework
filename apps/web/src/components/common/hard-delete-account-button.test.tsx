import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/lib/http'
import { HardDeleteAccountButton } from './hard-delete-account-button'

const auth = vi.hoisted(() => ({
  id: '1',
  ability: { can: vi.fn(() => true) },
}))
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: typeof auth) => unknown) => selector(auth),
}))
vi.mock('@/lib/http', () => ({ default: { delete: vi.fn() } }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function setup() {
  const onDeleted = vi.fn()
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <HardDeleteAccountButton id='2' subject='ADMIN' onDeleted={onDeleted} />
    </QueryClientProvider>
  )
  return { onDeleted, user: userEvent.setup() }
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.ability.can.mockReturnValue(true)
  vi.mocked(http.delete).mockResolvedValue({ data: undefined })
})
afterEach(cleanup)

describe('Permanent account deletion confirmation', () => {
  it('waits for explicit confirmation before calling the permanent-delete endpoint', async () => {
    const { user, onDeleted } = setup()
    await user.click(
      screen.getByRole('button', { name: 'adminUsers.actions.hardDelete' })
    )
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(http.delete).not.toHaveBeenCalled()
    await user.click(
      screen.getByRole('button', {
        name: 'adminUsers.deleteDialog.hardConfirm',
      })
    )
    await waitFor(() =>
      expect(http.delete).toHaveBeenCalledWith('/admin-users/2/permanent')
    )
    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1))
  })

  it('cancels without deleting anything', async () => {
    const { user } = setup()
    await user.click(
      screen.getByRole('button', { name: 'adminUsers.actions.hardDelete' })
    )
    await user.click(screen.getByRole('button', { name: 'buttons.cancel' }))
    expect(http.delete).not.toHaveBeenCalled()
  })

  it('hides the action without delete permission', () => {
    auth.ability.can.mockReturnValue(false)
    setup()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
