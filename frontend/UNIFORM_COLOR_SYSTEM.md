# 🎨 Simplified 3-Color System

## Your Uniform Color Palette

We're using **ONLY 3 MAIN COLORS** across the entire application for complete uniformity:

### 🟢 GREEN (Primary)
**HEX**: `#16a34a` (green-600)  
**USE FOR**: ALL main actions on every page
- ✅ Submit buttons
- ✅ Save buttons
- ✅ Create/Post buttons
- ✅ Apply buttons
- ✅ Send buttons
- ✅ Confirm buttons
- ✅ Success status (Approved, Active, Completed)
- ✅ Primary CTAs

**Why Green?** You mentioned green is already used throughout your app - we're making it THE primary color everywhere!

### 🔵 BLUE (Secondary)
**HEX**: `#2563eb` (blue-600)  
**USE FOR**: Secondary/informational actions
- ✅ View Details buttons
- ✅ Learn More buttons
- ✅ Back buttons
- ✅ Info buttons
- ✅ In Progress status
- ✅ Secondary CTAs

**Why Blue?** Complements green perfectly and provides good contrast for less important actions.

### 🔴 RED (Danger Only)
**HEX**: `#dc2626` (red-600)  
**USE FOR**: ONLY destructive actions
- ❌ Delete buttons
- ❌ Remove buttons
- ❌ Reject buttons
- ❌ Cancel buttons (when destructive)
- ❌ Failed/Rejected status

**Why Red?** Universal danger color - users instantly recognize it as "be careful!"

### ⚪ Supporting Colors
- **Yellow**: Warnings/Pending only
- **Gray**: Neutral/Inactive states only
- **White**: Backgrounds
- **Gray**: Text and borders

---

## 📋 Universal Button Rules (Same on EVERY Page)

### Primary Action = GREEN
```tsx
<Button>Submit Application</Button>
<Button>Save Changes</Button>
<Button>Post Job</Button>
<Button>Send Message</Button>
<Button>Create Account</Button>
```

### Secondary Action = BLUE
```tsx
<Button variant="secondary">View Details</Button>
<Button variant="secondary">Learn More</Button>
<Button variant="secondary">Back</Button>
<Button variant="secondary">Cancel</Button>
```

### Delete/Remove = RED
```tsx
<Button variant="danger">Delete</Button>
<Button variant="danger">Remove</Button>
<Button variant="danger">Reject</Button>
```

---

## 🎯 Status Badge Rules (Same on EVERY Page)

### Green Badge = Positive
```tsx
<Badge variant="primary">Approved</Badge>
<Badge variant="primary">Active</Badge>
<Badge variant="primary">Completed</Badge>
<Badge variant="primary">Verified</Badge>
```

### Blue Badge = Info/In Progress
```tsx
<Badge variant="secondary">In Progress</Badge>
<Badge variant="secondary">New</Badge>
<Badge variant="secondary">Info</Badge>
```

### Yellow Badge = Warning/Pending
```tsx
<Badge variant="warning">Pending</Badge>
<Badge variant="warning">Under Review</Badge>
```

### Red Badge = Negative
```tsx
<Badge variant="danger">Rejected</Badge>
<Badge variant="danger">Failed</Badge>
<Badge variant="danger">Cancelled</Badge>
```

### Gray Badge = Neutral
```tsx
<Badge variant="gray">Inactive</Badge>
<Badge variant="gray">Draft</Badge>
```

---

## ✅ Consistency Checklist

Apply these rules to EVERY page:

### Landing Page
- [ ] "Get Started" button = GREEN
- [ ] "Learn More" button = BLUE
- [ ] All main CTAs = GREEN

### Login/Register
- [ ] "Sign In" button = GREEN
- [ ] "Create Account" button = GREEN
- [ ] "Forgot Password" link = BLUE

### Job Seeker Dashboard
- [ ] "Apply" buttons = GREEN
- [ ] "View Details" buttons = BLUE
- [ ] Job status badges follow color rules

### Employer Dashboard
- [ ] "Post Job" button = GREEN
- [ ] "View Applications" = BLUE
- [ ] "Delete Job" = RED
- [ ] Application status badges follow color rules

### Admin Dashboard
- [ ] "Approve" buttons = GREEN
- [ ] "Review" buttons = BLUE
- [ ] "Reject" buttons = RED
- [ ] Status badges follow color rules

### Mentor Pages
- [ ] "Accept Request" = GREEN
- [ ] "View Profile" = BLUE
- [ ] All status badges follow color rules

### RTB Pages
- [ ] "Export Report" = GREEN
- [ ] "View Analytics" = BLUE
- [ ] All charts use green/blue palette

### Messages/Notifications
- [ ] "Send" button = GREEN
- [ ] "Mark as Read" = BLUE
- [ ] Status indicators follow color rules

---

## 🚀 Implementation

### Using Components (Recommended)
```tsx
import Button from '../components/Button';
import Badge from '../components/Badge';

// Green for main action
<Button>Submit</Button>

// Blue for secondary action
<Button variant="secondary">Cancel</Button>

// Red for danger
<Button variant="danger">Delete</Button>

// Status badges
<Badge variant="primary">Approved</Badge>    {/* Green */}
<Badge variant="secondary">New</Badge>       {/* Blue */}
<Badge variant="warning">Pending</Badge>     {/* Yellow */}
<Badge variant="danger">Rejected</Badge>     {/* Red */}
```

### Using Classes Directly
```tsx
import { buttonStyles, badgeStyles } from '../styles/design-tokens';

<button className={buttonStyles.primary}>Submit</button>
<button className={buttonStyles.secondary}>View</button>
<button className={buttonStyles.danger}>Delete</button>

<span className={badgeStyles.primary}>Active</span>
<span className={badgeStyles.secondary}>Info</span>
```

---

## 🔄 Migration Steps

### Find & Replace ALL Pages

Use VS Code Find & Replace (`Ctrl+Shift+H`):

1. **Primary to Green**
   - Find: `bg-primary-600`
   - Replace: `bg-green-600`
   
   - Find: `hover:bg-primary-700`
   - Replace: `hover:bg-green-700`
   
   - Find: `text-primary-600`
   - Replace: `text-green-600`

2. **Secondary to Blue**
   - Find: `bg-secondary-600`
   - Replace: `bg-blue-600`
   
   - Find: `hover:bg-secondary-700`
   - Replace: `hover:bg-blue-700`
   
   - Find: `text-secondary-600`
   - Replace: `text-blue-600`

3. **Remove Any Other Colors**
   Look for and replace:
   - `bg-teal-` → `bg-green-`
   - `bg-cyan-` → `bg-green-`
   - `bg-indigo-` → `bg-blue-`
   - `bg-sky-` → `bg-blue-`
   - `bg-purple-` → `bg-blue-` (unless specific need)
   - `bg-orange-` → `bg-yellow-` (warnings only)

---

## 📖 Page-by-Page Examples

### Landing Page
```tsx
// Hero section
<Button size="large">Get Started</Button>           {/* GREEN */}
<Button variant="secondary" size="large">           {/* BLUE */}
  Learn More
</Button>

// Features
All primary CTAs = GREEN
All "Learn More" = BLUE
```

### Job Posting (Employer)
```tsx
<Button>Post Job</Button>                    {/* GREEN */}
<Button variant="secondary">Save Draft</Button>    {/* BLUE */}
```

### Application Review (Employer)
```tsx
<Button>Approve</Button>                     {/* GREEN */}
<Button variant="secondary">View Profile</Button>  {/* BLUE */}
<Button variant="danger">Reject</Button>           {/* RED */}
```

### Job Application (Job Seeker)
```tsx
<Button>Apply Now</Button>                   {/* GREEN */}
<Button variant="secondary">Save Job</Button>      {/* BLUE */}
```

### Admin Approval
```tsx
<Button>Approve Employer</Button>            {/* GREEN */}
<Button variant="secondary">View Details</Button>  {/* BLUE */}
<Button variant="danger">Reject</Button>           {/* RED */}
```

---

## 🎨 Visual Consistency

Every page should look like this:

```
┌─────────────────────────────────────┐
│  [🟢 Primary Action]                │  ← GREEN button
│  [🔵 Secondary Action]              │  ← BLUE button
│  [🔴 Delete] (if needed)            │  ← RED button
│                                     │
│  Status: [🟢 Approved]              │  ← GREEN badge
│  Info: [🔵 In Progress]             │  ← BLUE badge
│  Warning: [🟡 Pending]              │  ← YELLOW badge
└─────────────────────────────────────┘
```

---

## ❌ What NOT to Do

Don't use these colors anywhere:
- ❌ Purple buttons
- ❌ Orange buttons (except warnings)
- ❌ Pink buttons
- ❌ Teal buttons (use green instead)
- ❌ Cyan buttons (use blue instead)
- ❌ Indigo buttons (use blue instead)

---

## ✨ Benefits

1. **100% Uniform** - Every page looks consistent
2. **Easy to Remember** - Only 3 colors to think about
3. **Professional** - Clean, cohesive brand identity
4. **Accessible** - Clear visual hierarchy
5. **Faster Development** - No decisions about "which color?"

---

## 🎯 The Rule

**One Simple Rule to Remember:**

> Main Action = GREEN 🟢  
> Secondary Action = BLUE 🔵  
> Delete/Danger = RED 🔴  
> Everything Else = Status Colors (Yellow/Gray)

Apply this to EVERY page, EVERY button, EVERY badge - no exceptions!

---

**Updated**: December 2024  
**System**: Simplified 3-Color Uniform Design
