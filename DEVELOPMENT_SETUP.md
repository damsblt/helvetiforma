# Development Setup Guide

## Storage Configuration

This application supports two storage modes:

### 1. Supabase Storage (Production)
- Used when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured
- Provides persistent storage across deployments
- Recommended for production use

### 2. Local Storage (Development)
- Used for localhost development
- Sessions are stored in memory and reset on server restart
- Faster development cycle
- Includes sample data for testing

## Environment Variables

Add these to your `.env.local` file:

```bash
# WordPress API
NEXT_PUBLIC_WORDPRESS_API_URL=https://www.helvetiforma.ch/wp-json

# EmailJS (optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Supabase (for production)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Storage (set to 'true' for localhost)
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
```

## Switching Between Storage Modes

### For Localhost Development:
```bash
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
```

### For Production/Deployment:
```bash
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
# or remove the variable entirely
```

## Local Development Benefits

- **Fast Development**: No network latency
- **Sample Data**: Pre-populated with test sessions
- **Easy Testing**: Sessions persist during development session
- **No External Dependencies**: Works offline

## Production Benefits

- **Persistent Storage**: Data survives server restarts
- **Scalability**: Can handle multiple users
- **Backup & Recovery**: Data is safely stored in Supabase
- **Real-time Updates**: Supabase provides real-time capabilities

## Sample Data

When using local storage, the system automatically creates:
- 1 sample session for tomorrow
- Formation ID: 1 (Salaires)
- Duration: 2 hours

This allows you to immediately see how the calendar looks with data.
