# AuthContext Frontend Integration Guide

## Overview
The AuthContext has been completely rebuilt to match the backend authentication API (`backend/routes/auth.js`). It now provides a comprehensive authentication system with full backend integration.

## Key Features

### 1. **Complete User Interface**
The `User` interface now matches the backend user model with:
- Basic info: `id`, `name`, `email`, `role`
- Avatar with `url` and `public_id`
- Email verification status (`isEmailVerified`)
- Profile completion percentage (`profileCompletion`)
- Extended profile data: education, experience, skills
- Role-specific info: `companyInfo`, `mentorInfo`, `rtbInfo`
- Social links and preferences

### 2. **Authentication Methods**

#### **register(userData: RegisterData)**
- Registers new users with the backend
- Accepts: name, email, password, role, phone, companyInfo, avatar
- Returns: `{ success: boolean; message?: string }`
- Automatically logs in user after successful registration

#### **login(email: string, password: string)**
- Authenticates users via backend
- Stores token, refreshToken, and user data
- Returns: `{ success: boolean; message?: string }`

#### **logout()**
- Clears authentication tokens
- Notifies backend to invalidate session
- Clears localStorage

### 3. **Password Management**

#### **forgotPassword(email: string)**
- Sends password reset email via backend
- Returns: `{ success: boolean; message: string }`

#### **resetPassword(token: string, password: string, confirmPassword: string)**
- Resets password using reset token
- Validates password match and length
- Auto-logs in user after successful reset
- Returns: `{ success: boolean; message: string }`

#### **changePassword(currentPassword, newPassword, confirmPassword)**
- Changes password for logged-in users
- Requires authentication token
- Returns: `{ success: boolean; message: string }`

### 4. **Email Verification**

#### **verifyEmail(token: string)**
- Verifies user email using verification token
- Refreshes user data after verification
- Returns: `{ success: boolean; message: string }`

### 5. **Profile Management**

#### **updateProfile(data: ProfileUpdateData)**
- Updates user profile information
- Allowed fields: name, phone, location, dateOfBirth, gender, education, experience, skills, companyInfo, mentorInfo, rtbInfo, socialLinks, preferences
- Returns: `{ success: boolean; message: string; user?: User }`

### 6. **Token Management**

#### **refreshAuthToken()**
- Refreshes access token using refresh token
- Automatically called when token expires
- Returns: `boolean`

#### **getCurrentUser()**
- Fetches current user data from backend
- Called on app initialization
- Updates user state

### 7. **State Management**

The context provides:
- `user`: Current user object or null
- `token`: JWT access token
- `refreshToken`: JWT refresh token
- `loading`: Loading state for async operations
- `error`: Error message from last failed operation
- `clearError()`: Clears error state

## Usage Examples

### 1. Registration
```tsx
import { useAuth } from '../contexts/AuthContext';

function RegisterForm() {
  const { register, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'job-seeker',
      phone: '+1234567890'
    });

    if (result.success) {
      // User registered and logged in
      navigate('/dashboard');
    } else {
      // Handle error
      console.error(result.message);
    }
  };
}
```

### 2. Login
```tsx
function LoginForm() {
  const { login, loading, error } = useAuth();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };
}
```

### 3. Profile Update
```tsx
function ProfileEditor() {
  const { updateProfile, user } = useAuth();

  const handleUpdate = async () => {
    const result = await updateProfile({
      name: 'Updated Name',
      phone: '+9876543210',
      skills: ['JavaScript', 'TypeScript', 'React'],
      education: [{
        institution: 'University',
        degree: 'BS',
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01',
        endDate: '2024-05'
      }]
    });

    if (result.success) {
      console.log('Profile updated:', result.user);
    }
  };
}
```

### 4. Password Reset Flow
```tsx
// Step 1: Request reset
function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const handleForgotPassword = async (email) => {
    const result = await forgotPassword(email);
    // Show message regardless of success for security
    alert(result.message);
  };
}

// Step 2: Reset with token
function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { token } = useParams(); // Get token from URL

  const handleReset = async (password, confirmPassword) => {
    const result = await resetPassword(token, password, confirmPassword);
    if (result.success) {
      // User is now logged in
      navigate('/dashboard');
    }
  };
}
```

### 5. Protected Route
```tsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

### 6. Email Verification
```tsx
function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const { token } = useParams();

  useEffect(() => {
    const verify = async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        alert('Email verified successfully!');
        navigate('/dashboard');
      }
    };
    verify();
  }, [token]);
}
```

## Data Persistence

The AuthContext automatically:
- Stores `token`, `refreshToken`, and `user` in localStorage
- Restores session on page reload
- Clears data on logout

## Error Handling

All methods:
- Set the `error` state on failure
- Return success/failure status
- Provide descriptive error messages
- Handle network errors gracefully

Use `clearError()` to clear error state when needed.

## Backend Integration

The context uses:
- `API_BASE_URL` from `config/api.ts`
- Endpoints defined in `API_ENDPOINTS.AUTH`
- `credentials: 'include'` for cookie support
- Bearer token authentication

## Security Features

1. **Token-based authentication** with JWT
2. **Refresh token** for seamless session management
3. **HTTP-only cookies** support
4. **Automatic token refresh** when expired
5. **Password validation** (minimum 6 characters)
6. **Email verification** workflow
7. **Secure password reset** with tokens

## TypeScript Support

All interfaces are fully typed:
- `User` - Complete user object
- `RegisterData` - Registration payload
- `ProfileUpdateData` - Profile update payload
- `Education`, `Experience` - Extended profile types
- `CompanyInfo`, `MentorInfo`, `RTBInfo` - Role-specific types

## Migration Notes

### Changes from old AuthContext:

1. **Return values changed**: Methods now return `{ success: boolean; message?: string }` instead of just `boolean`
2. **New token management**: Now tracks both `token` and `refreshToken`
3. **New methods added**: `changePassword`, `verifyEmail`, `updateProfile`, `refreshAuthToken`, `getCurrentUser`, `clearError`
4. **User interface updated**: More fields, proper typing
5. **Full backend integration**: No more mock data
6. **Error state**: New `error` state for better error handling

### Update your components:

```tsx
// OLD
const success = await login(email, password);
if (success) { ... }

// NEW
const result = await login(email, password);
if (result.success) { ... }
```

## Environment Variables

Make sure your `.env` file has:
```
VITE_API_URL=http://localhost:5000
```

## Next Steps

1. Update all auth-related components to use new return format
2. Implement email verification flow
3. Add token refresh interceptor for API calls
4. Consider adding auto-logout on token expiry
5. Add "Remember Me" functionality if needed
