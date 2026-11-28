import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/button'
import { FormActions } from './form-actions'
import { PageHeader } from './page-shell'

describe('Shared page structure', () => {
  it('groups title, description, badges and actions without nesting headings', () => {
    const { container } = render(
      <MemoryRouter>
        <PageHeader
          title='Edit category'
          description='Update category details.'
          badges={<span>Active</span>}
          actions={
            <>
              <Button variant='outline'>Cancel</Button>
              <Button>Save</Button>
            </>
          }
        />
      </MemoryRouter>
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Edit category' })
    ).toBeInTheDocument()
    expect(screen.getByText('Update category details.')).toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-slot="page-header"] [data-slot="form-actions"]'
      )
    ).toContainElement(screen.getByRole('button', { name: 'Save' }))
    expect(container.querySelectorAll('h1')).toHaveLength(1)
  })

  it('uses the same alignment and gap for header and footer actions', () => {
    const { container } = render(
      <>
        <FormActions>
          <Button>Save</Button>
        </FormActions>
        <FormActions footer>
          <Button>Save</Button>
        </FormActions>
      </>
    )
    const rows = container.querySelectorAll('[data-slot="form-actions"]')
    for (const row of rows)
      expect(row).toHaveClass('flex', 'items-center', 'justify-end', 'gap-2')
    expect(rows[1]).toHaveClass('border-t', 'pt-6')
  })
})
