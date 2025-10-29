# Design System & Style Guide

## Color Palette

### Primary Colors (Teal/Cyan)
- Used for main actions, primary buttons, and key UI elements
- `primary-600` (#0d9488) - Main brand color
- `primary-700` (#0f766e) - Hover states

### Secondary Colors (Blue)
- Used for secondary actions and complementary elements
- `secondary-600` (#0284c7) - Secondary brand color
- `secondary-700` (#0369a1) - Hover states

### Status Colors
- **Success**: Green (`green-600`) - Approvals, completions, success states
- **Warning**: Yellow (`yellow-600`) - Pending states, cautions
- **Danger**: Red (`red-600`) - Errors, deletions, rejections
- **Info**: Blue (`blue-600`) - Information, neutral states

## Components

### Buttons

Import the Button component:
```tsx
import Button from '../components/Button';
```

#### Usage Examples:

```tsx
// Primary button (default)
<Button>Submit</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Outline button
<Button variant="outline">Learn More</Button>

// Danger button
<Button variant="danger">Delete</Button>

// Success button
<Button variant="success">Approve</Button>

// With icon
<Button icon={<Plus className="h-4 w-4" />}>Add New</Button>

// Different sizes
<Button size="small">Small</Button>
<Button size="large">Large</Button>
```

### Badges

Import the Badge component:
```tsx
import Badge from '../components/Badge';
```

#### Usage Examples:

```tsx
// Status badges
<Badge variant="success">Approved</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Rejected</Badge>
<Badge variant="primary">Active</Badge>

// Small badges
<Badge size="small" variant="success">New</Badge>
```

### Cards

Import the Card component:
```tsx
import Card from '../components/Card';
```

#### Usage Examples:

```tsx
// Default card
<Card>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

// Clickable card with hover effect
<Card variant="hover" onClick={() => console.log('clicked')}>
  <h3>Clickable Card</h3>
</Card>

// Card without padding (for custom layouts)
<Card variant="noPadding">
  <div className="p-6">Custom padding</div>
</Card>
```

### Input Fields

Import styles:
```tsx
import { inputStyles } from '../styles/design-tokens';
```

#### Usage Examples:

```tsx
// Default input
<input 
  type="text"
  className={inputStyles.default}
  placeholder="Enter text"
/>

// Error state input
<input 
  type="text"
  className={inputStyles.error}
  placeholder="Invalid input"
/>
```

## Direct Class Usage (When components can't be used)

### Buttons
```tsx
import { buttonStyles } from '../styles/design-tokens';

<button className={buttonStyles.primary}>Primary</button>
<button className={buttonStyles.secondary}>Secondary</button>
<button className={buttonStyles.outline}>Outline</button>
<button className={buttonStyles.danger}>Delete</button>
```

### Badges
```tsx
import { badgeStyles } from '../styles/design-tokens';

<span className={badgeStyles.success}>Approved</span>
<span className={badgeStyles.warning}>Pending</span>
```

### Gradients
```tsx
import { gradientStyles } from '../styles/design-tokens';

<div className={gradientStyles.primary}>Primary gradient</div>
<div className={gradientStyles.hero}>Hero section</div>
```

## Best Practices

1. **Always use the design tokens** instead of hard-coding colors
2. **Use the Button component** for all buttons when possible
3. **Use the Badge component** for all status indicators
4. **Maintain consistency** across all pages and user roles
5. **Primary color** for main actions (Submit, Save, Create)
6. **Secondary color** for alternative actions
7. **Danger color** for destructive actions (Delete, Remove)
8. **Success color** for positive actions (Approve, Confirm)

## Migration Guide

### Old Pattern:
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Submit
</button>
```

### New Pattern:
```tsx
<Button variant="primary">Submit</Button>
```

### Old Badge Pattern:
```tsx
<span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
  Approved
</span>
```

### New Badge Pattern:
```tsx
<Badge variant="success">Approved</Badge>
```

## Common Use Cases

### Action Buttons
- **Primary action**: `<Button>Save</Button>`
- **Secondary action**: `<Button variant="secondary">Cancel</Button>`
- **Delete action**: `<Button variant="danger">Delete</Button>`
- **Approve action**: `<Button variant="success">Approve</Button>`

### Status Indicators
- **Success**: `<Badge variant="success">Completed</Badge>`
- **Pending**: `<Badge variant="warning">Pending</Badge>`
- **Failed**: `<Badge variant="danger">Failed</Badge>`
- **Active**: `<Badge variant="primary">Active</Badge>`

### Navigation
- **Primary link**: Use `linkStyles.primary` class
- **Danger link**: Use `linkStyles.danger` class

## Color Consistency Rules

1. **Primary (Teal)**: Main brand color, primary CTAs, active states
2. **Secondary (Blue)**: Secondary actions, information, complementary elements
3. **Green**: Success, approvals, positive actions
4. **Yellow**: Warnings, pending states, cautions
5. **Red**: Errors, deletions, rejections, critical actions
6. **Gray**: Neutral states, disabled elements, secondary text
