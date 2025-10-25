# Quick Fix Summary - October 1, 2025

## 🐛 Issues Fixed

### 1. **Multiple Dev Servers Running**
**Problem:** 3 dev servers were running on different ports (3000, 3002, etc.)  
**Symptom:** API calls going to wrong port (404 errors)  
**Solution:** 
```bash
pkill -f "next dev"  # Kill all servers
npm run dev           # Start fresh single server
```

### 2. **URL Encoding for Calendar IDs**
**Problem:** Microsoft calendar event IDs contain special characters (`=` signs)  
**Example ID:** `AAMkAGVhZjdhMGUyLWMyMjMtNDdhYy04YTNhLTVjZGI0ZmVkOTk3NwBGAAAAAAB7LBlDDcO9SpEckhvCr0G2BwCL8eOqdmqrS7kPYO9X7yiGAAAAAAENAACL8eOqdmqrS7kPYO9X7yiGAAADA-OvAAA=`

**Solution:** URL encode the ID before making API calls
```typescript
// Before
fetch(`/api/webinars/${webinarId}/register`)

// After  
const encodedId = encodeURIComponent(webinarId)
fetch(`/api/webinars/${encodedId}/register`)
```

### 3. **Next.js 15 Dynamic Routes**
**Problem:** Route params are now Promises  
**Solution:** Await params in API routes
```typescript
// Before (Next.js 14)
{ params }: { params: { id: string } }
const webinar = await getTeamsWebinar(params.id)

// After (Next.js 15)
{ params }: { params: Promise<{ id: string }> }
const { id } = await params
const webinar = await getTeamsWebinar(id)
```

---

## ✅ What to Do Now

1. **Refresh your browser** (hard refresh: Cmd+Shift+R)
2. **Visit** http://localhost:3000/calendrier
3. **Click** "S'inscrire maintenant"
4. **Should work!** ✅

---

## 🔍 How to Debug API Issues

### Check Server Logs
Look in your terminal where `npm run dev` is running for any errors.

### Check Network Tab
In browser DevTools (F12):
1. Go to Network tab
2. Click the failed request
3. Check:
   - URL (should be localhost:3000, not 3002)
   - Status code
   - Response body

### Test API Directly
```bash
# Test GET route
curl "http://localhost:3000/api/webinars/ENCODED_ID"

# Test POST route (needs auth cookie)
curl -X POST "http://localhost:3000/api/webinars/ENCODED_ID/register" \
  -H "Cookie: your-session-cookie"
```

---

## 📝 Files Modified

1. `src/app/(site)/calendrier/page.tsx` - Added URL encoding
2. `src/app/api/webinars/[id]/route.ts` - Fixed params Promise
3. `src/app/api/webinars/[id]/register/route.ts` - Fixed params Promise

---

## 🎯 Current Status

- ✅ Single dev server running on port 3000
- ✅ API routes fixed for Next.js 15
- ✅ URL encoding added for calendar IDs
- ✅ Ready for testing registration!

---

**Try it now!** The registration should work! 🚀

