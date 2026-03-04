# Frontend Development Guidelines

This document outlines the UI standards and patterns established for the Tuinet v2 project, ensuring consistency across the Admin and Dashboard interfaces.

## 1. Design System & CSS Variables
We use a dark-themed CSS variable system defined in `src/app/globals.css`.

- **Primary Color**: `--primary` (`#e03f3f`) - Used for main actions and branding.
- **Backgrounds**: `--background` (`#1d1f23`), `--card` (`#222529`).
- **Accent**: `--accent` (`#f2b830`) - Used for hover states and highlights.
- **Destructive**: `--destructive` (`#b91c1c`) - Used for delete/danger actions.

## 2. Standard CSS Classes
Use these utility classes for consistent button styling:

| Class | Usage | Visual |
|-------|-------|--------|
| `.btn-primary` | Main CTA (Create, Save, Submit) | Solid Red |
| `.btn-secondary` | Secondary actions (Cancel, Back) | Bordered |
| `.btn-action` | Table/Row actions (Edit, View, Refresh) | Square icon button (Accent hover) |
| `.btn-action-danger` | Destructive row actions (Delete) | Square icon button (Red hover) |
| `.input-standard` | Standard form text inputs | Background-colored |
| `.input-secondary` | Search/Secondary inputs | Slightly lighter/accented |

Example Usage:
```tsx
<button className="btn-primary">Save Changes</button>
<button className="btn-action"><Plane className="h-4 w-4" /></button>
<input className="input-standard" placeholder="Name" />
```

## 3. User Feedback & Notifications
We use **Sonner** for all non-blocking notifications. Avoid using `window.alert()`.

### Success/Error Toasts
```tsx
import { toast } from 'sonner'

toast.success('Action completed successfully')
toast.error('Failed to update record: ' + error.message)
```

### Loading States
Always use `useTransition` when calling server actions to provide feedback via loading spinners.
```tsx
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'

const [isPending, startTransition] = useTransition()

const handleAction = () => {
  startTransition(async () => {
    const result = await myServerAction()
    // handle toast...
  })
}

// In JSX
{isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
```

## 4. Standard Table Pattern
Standardized table classes are defined in `globals.css` to ensure consistent padding, alignment, and hover effects across all modules.

### Recommended Structure
```tsx
<div className="table-container">
  <table className="table-standard">
    <thead className="table-head-standard">
      <tr>
        <th className="table-th-standard">Column A</th>
        <th className="table-th-standard">Column B</th>
        <th className="table-th-standard text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr className="table-row-standard">
        <td className="table-td-standard">Data A</td>
        <td className="table-td-standard">Data B</td>
        <td className="table-td-standard text-right">
          {/* Action buttons with gap-2 */}
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

| Class | Purpose |
|-------|---------|
| `.table-container` | Wrapper that provides border, radius, and background. |
| `.table-standard` | Base table styles (width, font size). |
| `.table-head-standard` | Styles for the table header row background and border. |
| `.table-th-standard` | Styles for header cells (uppercase, bold, muted color). |
| `.table-row-standard` | Row styles including border and hover transition. |
| `.table-td-standard` | Base cell padding and text color. |

## 5. Shared UI Components
We maintain a set of reusable components in `src/components/ui`.

### DatePicker
A lightweight date picker that supports the `dd/mm/yyyy` format.
```tsx
import { DatePicker } from '@/components/ui/date-picker'
// ...
<DatePicker value={date} onChange={setDate} />
```

### MultiSelectDropdown
Used for selecting multiple items (e.g., Filtering multiple Airlines or Statuses).
```tsx
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown'
// ...
<MultiSelectDropdown
  options={items}
  selected={selectedItems}
  onChange={setSelectedItems}
  label="Items"
/>
```

## 6. Icons & Visual Elements
We use **lucide-react** for all UI icons.

- **Standard Size**: Use `h-4 w-4` for button icons and sidebar items.
- **Server-to-Client Pattern**: When passing icons from a Server Component to a Client Component, do **not** pass the icon component directly (it is not serializable). Instead, pass a string identifier (e.g., `'users'`) and use a lookup map in the Client Component.

### Example Icon Mapping
```tsx
// In Client Component
import { Users, Plane } from 'lucide-react'

const IconMap = {
  users: Users,
  plane: Plane
}

// Render logic
const Icon = IconMap[iconName]
return <Icon className="h-4 w-4" />
```
