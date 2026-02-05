# Auth Pages

OAuth-related UI pages for RoastMyStartup using RetroUI styling.

## Pages

### `/auth/login`
- **Headline**: "Welcome back. Ready for more pain?"
- **Features**:
  - Google OAuth button (UI only)
  - GitHub OAuth button (UI only)
  - Email + password fields
  - Login button
  - Link to signup page
  - Link back to home

### `/auth/signup`
- **Headline**: "Before we roast your startup…"
- **Features**:
  - Google OAuth signup button (UI only)
  - GitHub OAuth signup button (UI only)
  - Email, password, and confirm password fields
  - Disclaimer: "We do not validate feelings. Only ideas."
  - Create account button
  - Link to login page
  - Link back to home

### `/auth/continue`
- **Headline**: "Preparing the roast…"
- **Subtext**: "Buckle up. We're sharpening the knives."
- **Features**:
  - Animated loader with spinning knife icon
  - Animated loading dots
  - Progress bars with pulse animation
  - Status messages showing roast preparation
  - No buttons (loading state only)

## Design System

All pages use RetroUI components:
- White background
- Thick black borders (2px)
- Offset shadow (6px x 6px)
- Bold typography
- Yellow accent color (#eab308)
- Responsive design

## Implementation Notes

- **UI Only**: No OAuth logic or API calls implemented
- **Non-functional**: Buttons log to console only
- **Ready for Backend**: Easy to plug in OAuth providers and authentication logic later
- **Responsive**: Works on mobile and desktop
- **No Console Errors**: Clean implementation with proper TypeScript types

## Next Steps (Backend Integration)

When ready to add functionality:
1. Replace `console.log` calls with actual OAuth handlers
2. Add form validation
3. Connect to authentication API
4. Add error handling and loading states
5. Implement redirect logic after successful auth
