# Route "/" Bug Fix Test Scenarios

## Problem Identified
The original issue was in `/src/routes/index.tsx` where the route was immediately redirecting to "/sign-in" when `auth.isLoading` was true. This created a problematic flow:

1. **Original Logic**: 
   ```typescript
   if (auth.isLoading) {
     throw redirect({ to: "/sign-in" as string });
   }
   ```

2. **Problem**: This caused immediate redirects during the auth initialization phase, potentially creating redirect loops or errors when navigating to "/".

## Fix Applied
Changed the logic to properly handle the loading state:

```typescript
// Don't redirect while loading, let the component handle it
if (auth.isLoading) {
  return; // Allow component to render loading state
}
```

## Test Scenarios

### Scenario 1: Fresh Page Load to "/"
- **Expected**: Shows loading spinner while auth initializes
- **Then**: Redirects to `/sign-in` if not authenticated, or `/residents` if authenticated

### Scenario 2: Navigation from Authenticated State to "/"
- **Expected**: Immediately redirects to `/residents` (no loading state)

### Scenario 3: Navigation from Unauthenticated State to "/"
- **Expected**: Immediately redirects to `/sign-in` (no loading state)

## Testing Instructions

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/` in your browser

3. Observe the behavior:
   - Should show a loading spinner briefly
   - Then redirect appropriately based on authentication state

4. Test navigation from authenticated pages back to "/" to ensure no errors

## Files Modified
- `/src/routes/index.tsx` - Fixed redirect logic and added proper loading component
