# Vercel Large File Upload Configuration

## Issue: 413 Payload Too Large Error

Vercel Serverless Functions have a body size limit that can cause 413 errors when uploading large files.

## Current Configuration

### 1. Route Settings (`app/api/upload/route.ts`)
```typescript
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes
```

### 2. Vercel Configuration (`vercel.json`)
```json
{
  "functions": {
    "app/api/upload/route.ts": {
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

### 3. Next.js Configuration (`next.config.js`)
```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '100mb',
  },
}
```

## Vercel Body Size Limits

**Important:** Vercel has platform-level body size limits:
- **Hobby Plan**: 4.5 MB maximum
- **Pro Plan**: 4.5 MB maximum (default)
- **Enterprise Plan**: Custom limits available

## Solutions

### Option 1: Direct Upload to Supabase Storage (Recommended)

Instead of uploading through the API route, upload directly to Supabase Storage from the client:

1. Client uploads file to Supabase Storage
2. Client sends file path to API route
3. API route downloads from Supabase Storage and processes

### Option 2: Chunked Upload

Split large files into smaller chunks and upload sequentially.

### Option 3: Upgrade Vercel Plan

Contact Vercel support to increase body size limits (Enterprise plan).

### Option 4: Use Different Deployment

Deploy to a platform without body size limits:
- Railway
- Render
- Digital Ocean App Platform
- Self-hosted

## Current File Size Limit

- Client-side validation: 100MB
- Actual upload limit: **4.5MB on Vercel** (platform limitation)

## Recommendation

For files larger than 4.5MB, implement direct Supabase Storage upload:

```typescript
// Client-side: Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(`${entity}/${fileName}`, file);

// Then process the file server-side
await fetch('/api/upload/process', {
  method: 'POST',
  body: JSON.stringify({ filePath: data.path, entity }),
});
```

## Vercel Dashboard Settings

After deployment, check:
1. Go to Vercel Dashboard → Project Settings
2. Navigate to "Functions" tab
3. Verify timeout and memory settings are applied
4. Note: Body size cannot be increased beyond 4.5MB on Hobby/Pro plans
