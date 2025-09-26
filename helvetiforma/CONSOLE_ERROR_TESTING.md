# Console Error Suppression Testing

## How to Test Console Suppression

### 1. **Restart Development Server**
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. **Test Console Suppression**
1. Open your browser to `http://localhost:3000`
2. Open Developer Tools (F12)
3. Go to Console tab
4. After 2 seconds, you should see:
   - ✅ "HelvetiForma: Console error suppression is active"
   - ✅ "TEST: This error should NOT be suppressed"
   - ❌ You should NOT see the suppressed test messages

### 3. **Test Specific Pages**
- Visit `http://localhost:3000/test-console` (if 404, restart server first)
- Visit `http://localhost:3000/wp-dashboard` (uses new fallback component)

### 4. **Manual Console Test**
In the browser console, paste and run:
```javascript
// These should be suppressed (won't appear)
console.error('stats.wp.com/s-202539.js:1 Failed to load resource');
console.warn('Potential permissions policy violation: payment is not allowed');
console.error('Refused to display in a frame because it set X-Frame-Options');

// This should appear
console.error('This is a normal error that should appear');
```

## Expected Results

### ✅ Should Be Suppressed:
- `stats.wp.com` errors
- `ERR_BLOCKED_BY_CLIENT` errors  
- `X-Frame-Options` errors
- `Refused to display` errors
- `Potential permissions policy violation` warnings
- `payment is not allowed` warnings
- `failed to load resource` errors

### ✅ Should Still Appear:
- Normal application errors
- Other console messages
- Debug information

## If Console Suppression Isn't Working

1. **Check browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Check console timing**: Suppression activates after page load
3. **Verify script loading**: Look for "Console error suppression is active" message
4. **Check browser compatibility**: Some ad blockers might interfere

## Alternative Solutions

If console suppression doesn't work perfectly:

1. **Use fallback iframe component** in problem pages
2. **Upload WordPress changes** to fix root cause
3. **Disable ad blocker** temporarily for development
4. **Use browser dev tools filters** to hide specific error types

## Browser Console Filters

You can also filter console messages in browser dev tools:
1. Open Console tab
2. Click filter icon
3. Add negative filters: `-stats.wp.com -ERR_BLOCKED_BY_CLIENT -X-Frame-Options`

