# Color Consistency Migration Guide

This guide will help you replace all inconsistent colors across the application with the standardized design system.

## Quick Reference

### Color Replacements

#### Primary Color (Teal) - Use for main actions
- Replace `bg-blue-600` → `bg-primary-600`
- Replace `hover:bg-blue-700` → `hover:bg-primary-700`
- Replace `text-blue-600` → `text-primary-600`
- Replace `text-blue-500` → `text-primary-600`
- Replace `border-blue-` → `border-primary-`

#### Secondary Color - Keep as is (already blue)
- `bg-secondary-600`, `text-secondary-600` are correct

#### Success/Green - Use for approvals, success states
- `bg-green-600`, `text-green-600`, `hover:bg-green-700` are correct

#### Danger/Red - Use for deletions, errors
- `bg-red-600`, `text-red-600`, `hover:bg-red-700` are correct

#### Warning/Yellow - Use for pending, warnings
- `bg-yellow-600`, `text-yellow-600` are correct

## Step-by-Step Migration

### 1. Update Button Styles

#### Old Pattern:
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
  Submit
</button>
```

#### New Pattern (Option A - Using component):
```tsx
import Button from '../components/Button';

<Button variant="primary">Submit</Button>
```

#### New Pattern (Option B - Using design tokens):
```tsx
import { buttonStyles } from '../styles/design-tokens';

<button className={buttonStyles.primary}>Submit</button>
```

### 2. Update Badge/Status Styles

#### Old Pattern:
```tsx
<span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
  Active
</span>
```

#### New Pattern (Option A - Using component):
```tsx
import Badge from '../components/Badge';

<Badge variant="primary">Active</Badge>
```

#### New Pattern (Option B - Using design tokens):
```tsx
import { badgeStyles } from '../styles/design-tokens';

<span className={badgeStyles.primary}>Active</span>
```

### 3. Update Icon Colors

#### Old Pattern:
```tsx
<Icon className="h-5 w-5 text-blue-600" />
```

#### New Pattern:
```tsx
import { iconColors } from '../styles/design-tokens';

<Icon className={`h-5 w-5 ${iconColors.primary}`} />
```

### 4. Update Link Styles

#### Old Pattern:
```tsx
<a className="text-blue-600 hover:text-blue-700 font-medium">
  Click here
</a>
```

#### New Pattern:
```tsx
import { linkStyles } from '../styles/design-tokens';

<a className={linkStyles.primary}>Click here</a>
```

## Global Find & Replace

Use your editor's find and replace feature (Ctrl+Shift+H in VS Code):

### 1. Replace Blue with Primary
- Find: `text-blue-600`
- Replace: `text-primary-600`

- Find: `text-blue-500`
- Replace: `text-primary-600`

- Find: `bg-blue-600`
- Replace: `bg-primary-600`

- Find: `hover:bg-blue-700`
- Replace: `hover:bg-primary-700`

- Find: `border-blue-600`
- Replace: `border-primary-600`

### 2. Keep Intentional Colors
Do NOT replace these (they're correct):
- `bg-green-` (success states)
- `bg-red-` (danger/error states)
- `bg-yellow-` (warning states)
- `bg-secondary-` (secondary actions)
- `bg-gray-` (neutral states)

## File-by-File Checklist

### High Priority Files (User-facing):
- [ ] `frontend/src/pages/shared/LandingPage.tsx` ✅ DONE
- [ ] `frontend/src/pages/auth/LoginPage.tsx`
- [ ] `frontend/src/pages/auth/RegisterPage.tsx`
- [ ] `frontend/src/pages/job-seeker/Dashboard.tsx`
- [ ] `frontend/src/pages/employer/Dashboard.tsx`
- [ ] `frontend/src/pages/admin/Dashboard.tsx`
- [ ] `frontend/src/pages/mentor/Dashboard.tsx`
- [ ] `frontend/src/pages/rtb/Dashboard.tsx`

### Component Files:
- [ ] `frontend/src/components/DashboardLayout.tsx`
- [ ] `frontend/src/components/JobCard.tsx`
- [ ] `frontend/src/components/ApplicationReviewModal.tsx`
- [ ] `frontend/src/components/JobApplicationForm.tsx`

### Other Pages:
- [ ] All files in `frontend/src/pages/shared/`
- [ ] All files in `frontend/src/pages/mentor/`
- [ ] All files in `frontend/src/pages/rtb/`
- [ ] All files in `frontend/src/pages/employer/`
- [ ] All files in `frontend/src/pages/job-seeker/`

## Testing Checklist

After migration, verify:
- [ ] All primary action buttons are teal (`primary-600`)
- [ ] All secondary buttons are blue (`secondary-600`)
- [ ] Success buttons/badges are green
- [ ] Danger/delete buttons are red
- [ ] Warning/pending states are yellow
- [ ] All hover states work correctly
- [ ] No broken styling
- [ ] Consistent look across all pages

## Common Patterns by Use Case

### Action Buttons:
- **Primary action** (Save, Submit, Create): `bg-primary-600`
- **Secondary action** (Cancel, Back): `bg-secondary-600` or `outline`
- **Approve**: `bg-green-600`
- **Delete/Remove**: `bg-red-600`

### Status Indicators:
- **Active/In Progress**: `primary` (teal)
- **Success/Approved/Completed**: `success` (green)
- **Pending/Warning**: `warning` (yellow)
- **Failed/Rejected**: `danger` (red)
- **Inactive/Disabled**: `gray`

### Links:
- **Primary navigation**: `text-primary-600 hover:text-primary-700`
- **Danger actions**: `text-red-600 hover:text-red-700`
- **Secondary info**: `text-secondary-600 hover:text-secondary-700`

## Quick Scripts

### VS Code Regex Find & Replace

1. Open Find & Replace (Ctrl+Shift+H)
2. Enable regex mode (.*icon in search box)
3. Search in: `frontend/src/**/*.tsx`

#### Replace blue buttons with primary:
Find: `className="(.*?)bg-blue-600(.*?)"`
Replace: `className="$1bg-primary-600$2"`

#### Replace blue text with primary:
Find: `text-blue-(500|600|700)`
Replace: `text-primary-$1`

#### Replace blue hover with primary:
Find: `hover:bg-blue-(600|700|800)`
Replace: `hover:bg-primary-$1`

## Need Help?

Refer to:
- `frontend/STYLE_GUIDE.md` - Complete style guide
- `frontend/src/styles/design-tokens.ts` - All design tokens
- `frontend/src/components/Button.tsx` - Button component
- `frontend/src/components/Badge.tsx` - Badge component
- `frontend/src/components/Card.tsx` - Card component
