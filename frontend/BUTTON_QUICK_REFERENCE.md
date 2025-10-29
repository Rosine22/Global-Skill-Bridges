# 🎨 Button Color Quick Reference Card

## Copy-Paste Ready Examples

### 1️⃣ PRIMARY (Teal) - Main Actions
```tsx
// Component usage
<Button variant="primary">Submit</Button>
<Button variant="primary" size="large">Get Started</Button>
<Button variant="primary" icon={<Plus />}>Add New</Button>

// Direct className (if needed)
className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
```

**Use for:** Submit, Save, Create, Post, Send, Register, Apply, Get Started

---

### 2️⃣ SECONDARY (Blue) - Alternative Actions
```tsx
// Component usage
<Button variant="secondary">View Details</Button>
<Button variant="secondary" size="small">Cancel</Button>
<Button variant="secondary" icon={<Eye />}>View</Button>

// Direct className (if needed)
className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
```

**Use for:** View Details, Learn More, Back, Cancel (non-destructive), Info, Filter

---

### 3️⃣ SUCCESS (Green) - Approval Actions
```tsx
// Component usage
<Button variant="success">Approve</Button>
<Button variant="success" icon={<Check />}>Accept</Button>
<Button variant="success" size="large">Confirm</Button>

// Direct className (if needed)
className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
```

**Use for:** Approve, Accept, Confirm, Complete, Verify, Mark as Done

---

### 4️⃣ DANGER (Red) - Destructive Actions
```tsx
// Component usage
<Button variant="danger">Delete</Button>
<Button variant="danger" icon={<Trash />}>Remove</Button>
<Button variant="danger" size="small">Reject</Button>

// Direct className (if needed)
className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
```

**Use for:** Delete, Remove, Reject, Cancel (destructive), Decline

---

## Outline Variants (Less Prominent)

```tsx
<Button variant="outline">Outlined Primary</Button>
<Button variant="outlineSecondary">Outlined Blue</Button>
<Button variant="outlineSuccess">Outlined Green</Button>
<Button variant="outlineDanger">Outlined Red</Button>
```

---

## Ghost Variants (Minimal)

```tsx
<Button variant="ghost">Ghost Primary</Button>
<Button variant="ghostSecondary">Ghost Blue</Button>
<Button variant="ghostGray">Ghost Gray</Button>
```

---

## Size Variants

```tsx
<Button variant="primary" size="small">Small</Button>
<Button variant="primary" size="medium">Medium</Button>  {/* Default */}
<Button variant="primary" size="large">Large</Button>
```

---

## With Icons (Lucide React)

```tsx
import { Plus, Trash, Check, X, Eye, Edit } from 'lucide-react';

<Button variant="primary" icon={<Plus />} iconPosition="left">Add</Button>
<Button variant="danger" icon={<Trash />} iconPosition="right">Delete</Button>
<Button variant="success" icon={<Check />}>Approve</Button>
```

---

## Common Patterns

### Form Submission
```tsx
<div className="flex gap-3">
  <Button variant="primary" type="submit">Submit</Button>
  <Button variant="ghostGray" type="button">Cancel</Button>
</div>
```

### Admin Actions
```tsx
<div className="flex gap-3">
  <Button variant="success" icon={<Check />}>Approve</Button>
  <Button variant="danger" icon={<X />}>Reject</Button>
  <Button variant="secondary" icon={<Eye />}>View</Button>
</div>
```

### Dashboard Actions
```tsx
<Button variant="primary" size="large" icon={<Plus />}>
  Post New Job
</Button>
<Button variant="secondary">View Applications</Button>
<Button variant="outline">Edit Profile</Button>
```

---

## ⚡ Quick Decision

| If the button... | Use... |
|-----------------|--------|
| Submits/Saves/Creates | `primary` (teal) |
| Views/Navigates/Info | `secondary` (blue) |
| Approves/Confirms | `success` (green) |
| Deletes/Rejects | `danger` (red) |

---

## 📝 Import Statement

```tsx
import Button from '../components/Button';
// Or with icon
import Button from '../components/Button';
import { Plus } from 'lucide-react';
```

---

## 🚫 Don't Use

❌ `bg-purple-600` - No purple in the system  
❌ `bg-orange-600` - No orange in the system  
❌ `bg-indigo-600` - No indigo in the system  
❌ Random colors - Stick to the 4-color system!

---

**Print this card and keep it handy! 📌**
