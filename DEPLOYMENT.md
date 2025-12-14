# Deployment Guide for Beyhan Family Website

This guide explains how to deploy your website with secure environment variables.

## ✅ Pre-Deployment Checklist

- [x] Firebase project created and configured
- [x] Environment variables configured in `.env` file
- [x] `.env` added to `.gitignore` (secured)
- [x] Email verification implemented
- [x] Production build created (`npm run build`)

## Deployment Options

Choose one of the following hosting platforms:

---

## Option 1: Netlify (Recommended - Free Tier)

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://www.netlify.com/)
2. Sign up with GitHub/GitLab/Email

### Step 2: Deploy via Drag & Drop (Quickest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your `dist` folder to the drop zone
3. Site will be deployed instantly with a random URL

### Step 3: Add Environment Variables
1. Go to your site's dashboard
2. Click **Site configuration** > **Environment variables**
3. Click **Add a variable** and add each one:
   ```
   VITE_FIREBASE_API_KEY = AIzaSyDzlKNFJ1ClEXy8TvTK29AeTaJe8MzDZYo
   VITE_FIREBASE_AUTH_DOMAIN = beyhan-family-website.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = beyhan-family-website
   VITE_FIREBASE_STORAGE_BUCKET = beyhan-family-website.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID = 967303162008
   VITE_FIREBASE_APP_ID = 1:967303162008:web:de9f26fca6a4a6c70d08ed
   ```

### Step 4: Connect to GitHub (Optional - Continuous Deployment)
1. Push your code to GitHub
2. In Netlify, click **Add new site** > **Import an existing project**
3. Connect to GitHub and select your repository
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variables (same as Step 3)
6. Click **Deploy site**

### Step 5: Custom Domain (Optional)

If you want to use your own domain instead of the Netlify subdomain:

#### Option A: You Already Own a Domain

**1. Access Domain Settings in Netlify**
   - In your site dashboard, click **"Domain management"** (or "Domains" in the left sidebar)
   - Click **"Add a domain"** or **"Add custom domain"** button

**2. Enter Your Domain**
   - Type your domain name (e.g., `family.beyhan.com` or `beyhanfamily.com`)
   - Click **"Verify"** or **"Add domain"**
   - Netlify will check if you own it

**3. Choose Domain Type**
   - **Subdomain** (e.g., `family.beyhan.com`) - Recommended for family sites
   - **Root domain** (e.g., `beyhanfamily.com`) - Uses entire domain

**4. Configure DNS Records**

Netlify will show you the DNS records you need to add. You have two options:

**Option 1: CNAME Record (For Subdomains - Easiest)**
   - Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
   - Find DNS settings or DNS management
   - Add a new **CNAME record**:
     - **Type:** CNAME
     - **Name/Host:** family (or whatever subdomain you want)
     - **Value/Points to:** your-site-name.netlify.app
     - **TTL:** 3600 (or Auto)
   - Save the record

**Option 2: A Record + AAAA Record (For Root Domains)**
   - Add an **A record**:
     - **Type:** A
     - **Name/Host:** @ (or leave blank)
     - **Value:** 75.2.60.5 (Netlify's IP)
     - **TTL:** 3600
   - Add an **AAAA record** (for IPv6):
     - **Type:** AAAA
     - **Name/Host:** @ (or leave blank)
     - **Value:** 2600:4040:9a0e::1
     - **TTL:** 3600

**5. Wait for DNS Propagation**
   - DNS changes take 5 minutes to 48 hours (usually under 1 hour)
   - Check status in Netlify - it will show "Awaiting External DNS" until propagated
   - Once verified, you'll see a green checkmark

**6. Enable HTTPS (Automatic)**
   - Netlify automatically provisions a free SSL certificate (Let's Encrypt)
   - This usually happens within a few minutes after DNS verification
   - Your site will be accessible via `https://family.beyhan.com`

**7. Set Primary Domain (Optional)**
   - If you added both www and non-www versions, choose which is primary
   - Netlify will automatically redirect the other to your primary domain

#### Option B: Buy a Domain Through Netlify

1. In **Domain management**, click **"Register a new domain"**
2. Search for available domain names
3. Purchase directly through Netlify (around $10-15/year)
4. DNS is automatically configured - no extra setup needed!

#### Common Domain Registrars DNS Instructions

**GoDaddy:**
- Login → My Products → DNS → Manage Zones → Add Record

**Namecheap:**
- Dashboard → Domain List → Manage → Advanced DNS → Add New Record

**Google Domains:**
- My Domains → Manage → DNS → Custom Records

**Cloudflare:**
- Select Domain → DNS → Add Record

#### Troubleshooting Custom Domains

**"Domain already in use"**
- The domain is registered with another Netlify site
- Remove it from the old site first

**DNS not propagating after 24 hours**
- Double-check the DNS records match exactly what Netlify shows
- Clear your browser cache and DNS cache
- Use [whatsmydns.net](https://www.whatsmydns.net/) to check propagation status

**SSL certificate not provisioning**
- Ensure DNS is fully propagated first
- Check that HTTPS is enabled in Netlify domain settings
- Wait up to 24 hours for certificate provisioning

#### Recommended Family Domain Options

If you don't have a domain yet:
- `beyhanfamily.com`
- `family.beyhan.com` (if you own beyhan.com)
- `beyhanfamily.net`
- Free Netlify subdomain works perfectly too! (e.g., `beyhan-family.netlify.app`)

---

## Option 2: Vercel (Free Tier)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com/)
2. Sign up with GitHub/GitLab/Email

### Step 2: Deploy from GitHub
1. Push your code to GitHub
2. In Vercel, click **Add New...** > **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3: Add Environment Variables
1. In project settings, go to **Environment Variables**
2. Add each variable:
   ```
   VITE_FIREBASE_API_KEY = AIzaSyDzlKNFJ1ClEXy8TvTK29AeTaJe8MzDZYo
   VITE_FIREBASE_AUTH_DOMAIN = beyhan-family-website.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = beyhan-family-website
   VITE_FIREBASE_STORAGE_BUCKET = beyhan-family-website.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID = 967303162008
   VITE_FIREBASE_APP_ID = 1:967303162008:web:de9f26fca6a4a6c70d08ed
   ```
3. Select **Production**, **Preview**, and **Development**
4. Click **Deploy**

---

## Option 3: Firebase Hosting (Free Tier)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase Hosting
```bash
cd "c:\Beyhan Family Website\Beyhan-Family"
firebase init hosting
```

Select:
- Use existing project: **beyhan-family-website**
- Public directory: **dist**
- Single-page app: **Yes**
- GitHub deployment: **No** (for now)

### Step 4: Deploy
```bash
npm run build
firebase deploy --only hosting
```

Your site will be live at: `https://beyhan-family-website.web.app`

**Note:** With Firebase Hosting, environment variables are already embedded in your build (from `.env`), so no additional configuration needed.

---

## Option 4: GitHub Pages (Free)

### Step 1: Update vite.config.ts
Add base path:
```typescript
export default defineConfig({
  base: '/Beyhan-Family/',  // Your repo name
  // ... rest of config
})
```

### Step 2: Install gh-pages
```bash
npm install --save-dev gh-pages
```

### Step 3: Add Deploy Script to package.json
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

### Step 4: Deploy
```bash
npm run deploy
```

**⚠️ Important:** GitHub Pages doesn't support environment variables. You'll need to embed values in the build or use a different hosting option.

---

## Updating Your Firebase Auth Domain

After deploying, you need to add your deployment URL to Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** > **Settings** > **Authorized domains**
4. Click **Add domain**
5. Add your deployment URL (e.g., `your-site.netlify.app`)

---

## Environment Variables Security Checklist

✅ **Completed:**
- [x] `.env` file created with actual values
- [x] `.env` added to `.gitignore`
- [x] `.env.example` created as template
- [x] `firebase.ts` uses `import.meta.env.*` instead of hardcoded values
- [x] Validation added to check for missing env vars

✅ **On Hosting Platform:**
- [ ] Environment variables added to hosting platform dashboard
- [ ] Deployment successful with env vars
- [ ] Test login functionality after deployment

---

## Sending Email Verification to Family Members

After adding users in Firebase Console, they'll need to verify their email:

### Option 1: Automatic (Recommended)
When you create a user in Firebase Console, check the box to **"Send verification email"**.

### Option 2: Manual Trigger
1. In Firebase Console > Authentication > Users
2. Find the user
3. Click the three dots (⋮) menu
4. Select **"Send verification email"**

### Option 3: Programmatic (Advanced)
Add a "Resend Verification" button to login page for unverified users.

---

## Testing Your Deployment

1. **Visit your deployed URL**
2. **Try logging in with an unverified account** → Should see verification error
3. **Verify email** → Click link in email
4. **Log in again** → Should work and redirect to dashboard

---

## Troubleshooting

### "Missing Firebase configuration" Error
- Check that environment variables are set in your hosting platform
- Redeploy after adding environment variables

### "Unauthorized domain" Error
- Add your deployment URL to Firebase Authorized Domains (see above)

### Build succeeds but site doesn't work
- Check browser console for errors
- Verify all environment variables are set correctly
- Ensure `.env` file exists locally during build

### Email verification not working
- Check spam folder
- Verify email template is enabled in Firebase Console
- Try resending verification email

---

## Recommended Deployment: Netlify

**Why Netlify?**
- ✅ Free tier with custom domain
- ✅ Easy environment variable management
- ✅ Automatic HTTPS
- ✅ Continuous deployment from GitHub
- ✅ Instant rollbacks
- ✅ No build time limits

**Deployment URL:** After deploying, share the URL with family members!

---

## Next Steps After Deployment

1. **Add your deployment URL to Firebase Authorized Domains**
2. **Create user accounts for family members** in Firebase Console
3. **Send verification emails** to all users
4. **Share the website URL and login instructions** with family
5. **Test login with multiple accounts**
6. **Set up custom domain** (optional)

Your website is now securely deployed! 🎉
