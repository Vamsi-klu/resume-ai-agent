# Deploying Resume AI Agent to Vercel

## Prerequisites

Before deploying, you need a **PostgreSQL database**. Choose one of these free options:

### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to **Settings → Database**
5. Copy the **Connection string (URI)** - looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### Option B: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string from the dashboard

---

## Step-by-Step Vercel Deployment

### Step 1: Go to Vercel
1. Open [vercel.com](https://vercel.com)
2. Sign in with your GitHub account

### Step 2: Import Repository
1. Click **"Add New..."** → **"Project"**
2. Find `resume-ai-agent` in your repository list
3. Click **"Import"**

### Step 3: Configure Environment Variables
Before clicking Deploy, add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string from Supabase/Neon |
| `GEMINI_API_KEY` | `YOUR_GEMINI_API_KEY_HERE` |
| `JWT_SECRET` | Generate one below 👇 |

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```
Or use this pre-generated one: `resume-ai-agent-jwt-secret-2024-production-secure`

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (2-3 minutes)

### Step 5: Initialize Database
After deployment, run this in your terminal:
```bash
npx prisma db push
```
Or in Vercel's Functions tab, the database will auto-migrate on first use.

---

## Post-Deployment Checklist

- [ ] Open your Vercel URL (e.g., `resume-ai-agent.vercel.app`)
- [ ] Test signup with a new account
- [ ] Test login
- [ ] Upload a PDF resume
- [ ] Run an analysis
- [ ] Check dark/light mode toggle
- [ ] Submit feedback

---

## Troubleshooting

### Database Connection Error
- Make sure `DATABASE_URL` includes `?sslmode=require` at the end
- Example: `postgresql://user:pass@host:5432/db?sslmode=require`

### Build Fails
- Check Vercel build logs for specific errors
- Ensure all environment variables are set

### API Rate Limit
- Users get 5 queries per 24-hour rolling window
- This is by design for production scalability

---

## Scaling for 10,000+ Users

For production scale:

1. **Database**: Upgrade to Supabase Pro or dedicated PostgreSQL
2. **Add Redis**: For faster rate limiting (optional)
3. **File Storage**: Switch to Vercel Blob or AWS S3
4. **CDN**: Vercel automatically provides global CDN
