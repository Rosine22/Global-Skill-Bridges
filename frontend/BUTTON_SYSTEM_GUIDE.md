# Unified Button Design System - 4-Color Palette

## Overview
This design system ensures **consistent button styling across all pages** using 4 carefully chosen colors that serve specific purposes.

## 🎨 The 4-Color System

### 1. **Primary (Teal)** - `bg-teal-600`
**Usage:** Main call-to-action buttons across the entire app
- Submit forms
- Save changes
- Create new items
- Post job
- Send message
- Get Started
- Register/Sign Up

**Example:**
```tsx
<button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
  Submit
</button>

// Or using the Button component
<Button variant="primary">Submit</Button>
```

### 2. **Secondary (Blue)** - `bg-blue-600`
**Usage:** Alternative or secondary actions
- View Details
- Learn More
- Back to previous page
- Cancel (non-destructive)
- Info buttons
- Filter/Search

**Example:**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
  View Details
</button>

// Or using the Button component
<Button variant="secondary">View Details</Button>
```

### 3. **Success (Green)** - `bg-green-600`
**Usage:** Positive/approval actions
- Approve application
- Accept request
- Confirm action
- Complete task
- Verify information
- Mark as done

**Example:**
```tsx
<button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
  Approve
</button>

// Or using the Button component
<Button variant="success">Approve</Button>
```

### 4. **Danger (Red)** - `bg-red-600`
**Usage:** Destructive or critical actions ONLY
- Delete item
- Reject application
- Remove user
- Cancel (destructive)
- Decline

**Example:**
```tsx
<button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
  Delete
</button>

// Or using the Button component
<Button variant="danger">Delete</Button>
```

---

## 📦 Using the Button Component

### Installation
The Button component is located at `frontend/src/components/Button.tsx` and is already set up.

### Import
```tsx
import Button from '../components/Button';
```

### Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 
            'outline' | 'outlineSecondary' | 'outlineSuccess' | 'outlineDanger' | 
            'ghost' | 'ghostSecondary' | 'ghostGray';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  onClick?: () => void;
  // ... all standard button props
}
```

### Examples

#### Basic Buttons
```tsx
<Button variant="primary">Submit Form</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="success">Approve</Button>
<Button variant="danger">Delete</Button>
```

#### With Icons
```tsx
import { Plus, Trash, Check, X } from 'lucide-react';

<Button variant="primary" icon={<Plus />} iconPosition="left">
  Add New
</Button>

<Button variant="danger" icon={<Trash />} iconPosition="right">
  Delete
</Button>

<Button variant="success" icon={<Check />}>
  Approve
</Button>
```

#### Different Sizes
```tsx
<Button variant="primary" size="small">Small Button</Button>
<Button variant="primary" size="medium">Medium Button</Button>
<Button variant="primary" size="large">Large Button</Button>
```

#### Outline Variants (Less Prominent)
```tsx
<Button variant="outline">Outlined Teal</Button>
<Button variant="outlineSecondary">Outlined Blue</Button>
<Button variant="outlineSuccess">Outlined Green</Button>
<Button variant="outlineDanger">Outlined Red</Button>
```

#### Ghost Variants (Minimal Styling)
```tsx
<Button variant="ghost">Ghost Teal</Button>
<Button variant="ghostSecondary">Ghost Blue</Button>
<Button variant="ghostGray">Ghost Gray</Button>
```

---

## 🔄 Migration Guide

### Step 1: Find All Button Colors
Search your codebase for these patterns:
- `bg-primary-600` → Replace with `bg-teal-600` (or use Button component with `variant="primary"`)
- `bg-blue-600` → Keep or use Button component with `variant="secondary"`
- `bg-green-600` → Use for approval actions with `variant="success"`
- `bg-purple-600` → Replace with one of the 4 main colors
- `bg-orange-600` → Replace with one of the 4 main colors
- `bg-indigo-600` → Replace with one of the 4 main colors

### Step 2: Decision Tree
Ask yourself: "What action does this button perform?"

```
Is it a main action (Submit, Save, Create)?
  → Use PRIMARY (Teal)

Is it an alternative action (View, Info, Cancel)?
  → Use SECONDARY (Blue)

Is it a positive action (Approve, Accept, Confirm)?
  → Use SUCCESS (Green)

Is it a destructive action (Delete, Reject, Remove)?
  → Use DANGER (Red)
```

### Step 3: Replace Inline Styles
**Before:**
```tsx
<button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
  Submit
</button>
```

**After:**
```tsx
<Button variant="primary">Submit</Button>
```

### Step 4: Update Import Statements
```tsx
import Button from '../components/Button';
```

---

## 🎯 Page-by-Page Examples

### Landing Page
```tsx
<Button variant="primary" size="large">Get Started</Button>
<Button variant="outline" size="large">Learn More</Button>
```

### Job Seeker Dashboard
```tsx
<Button variant="primary">Apply Now</Button>
<Button variant="secondary" size="small">View Details</Button>
```

### Employer Dashboard
```tsx
<Button variant="primary">Post New Job</Button>
<Button variant="success" icon={<Check />}>Approve</Button>
<Button variant="danger" icon={<X />}>Reject</Button>
```

### Admin Dashboard
```tsx
<Button variant="success">Approve Employer</Button>
<Button variant="danger">Reject</Button>
<Button variant="secondary">View Details</Button>
```

### Forms
```tsx
<Button variant="primary" type="submit">Submit</Button>
<Button variant="ghostGray" type="button">Cancel</Button>
```

---

## ✅ Best Practices

### DO:
✅ Use `primary` (teal) for ALL main actions across the app  
✅ Use `secondary` (blue) for alternative/info actions  
✅ Use `success` (green) ONLY for approval/positive actions  
✅ Use `danger` (red) ONLY for destructive actions  
✅ Use the Button component for consistency  
✅ Choose button variant based on the action's purpose  

### DON'T:
❌ Don't use random colors like purple, orange, indigo  
❌ Don't use green for "Create" - use teal (primary)  
❌ Don't use multiple colors on the same page for the same action type  
❌ Don't create custom button styles - use the design system  
❌ Don't mix inline className styles with the Button component  

---

## 🛠️ Quick Reference

| Action Type | Color | Variant | Example |
|------------|-------|---------|---------|
| Submit, Save, Create | Teal | `primary` | Submit Form |
| View, Info, Back | Blue | `secondary` | View Details |
| Approve, Accept | Green | `success` | Approve Application |
| Delete, Reject | Red | `danger` | Delete Account |

---

## 📝 Checklist for Implementation

- [ ] Import Button component in your page
- [ ] Replace all inline button styles with Button component
- [ ] Verify button colors match their action purpose
- [ ] Test hover states and disabled states
- [ ] Ensure consistency across all pages
- [ ] Remove unused button color classes

---

## 🚀 Result
After implementing this system, users will experience:
- **Visual consistency** across all pages
- **Clear action hierarchy** through color coding
- **Better UX** with predictable button behavior
- **Easier maintenance** with centralized button styles
