# Admin UI conventions

The admin app is an Operate surface. Use the existing shadcn system and runtime white label theme.

## Page structure

- `Main` owns page gutters and the 24px section gap. Do not add a second page gutter inside it.
- Use `PageHeader` for the page heading, description, badges, back navigation and actions. It supplies the single h1 and responsive action wrapping.
- Create/edit forms repeat the same action content at the top and bottom using `FormActions`; both copies share validation, pending and disabled state.
- Keep `PageHeader` outside decorative summary cards. `badges` contains status badges only; navigation buttons belong in the back/action slots.
- Use the default `CardHeader` and `CardContent` padding. Do not add vertical padding on top of the card’s own padding and gap.
- Use `PageShell` / `PageBody` for stacked content. Form fields use 16px gaps, sections use 24px gaps.
- Resource lists use `DataTable`, `DataTableToolbar` and the shared filtering, sorting and pagination controls.
- Existing resource routes use `/resource/create`, `/resource/:id/edit` and `/resource/:id/show`. Direct URLs must load their own data, handle loading/errors and respect `RouteAuthorize` permissions.
- `RecordPage` provides the shared route boundary for migrated editors and record views. Forms retain their existing validation and mutations.

## Dialogs

Upload and file picker workflows stay in modals, including choosing an asset inside a form. File drag/drop opens the upload modal in the current file manager.

Confirmations for deletion or an immediate action, short contextual operations such as move/share/merge, and code utilities may remain dialogs. Full resource detail, review, create and edit workflows use pages.

## Theme and component rules

- Use semantic Tailwind utilities backed by shadcn tokens: `background`, `foreground`, `card`, `muted`, `primary`, `secondary`, `accent`, `border`, `input`, `ring` and `destructive`.
- Pair solid primary surfaces with `primary-foreground`. Use tinted primary surfaces for supporting state indicators, and retain textual state labels.
- Use the shared `Badge` variants instead of picking a palette per page.
- Palette samples, user-selected category/folder colors, theme previews and actual media are data and retain their own colors.
- Avoid decorative gradients, glows, backdrop blur, large shadows and repeated title cards in task UI.
- Keep forms and tables usable at phone, tablet and desktop widths. Use a scroll container for wide data rather than clipping controls or creating document overflow.
