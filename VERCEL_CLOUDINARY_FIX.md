# 🔧 Fixing Vercel Cloudinary Environment Variables

## 🚨 Issue Identified
The error `Invalid api_key 171349119447393` shows Vercel is using an incorrect Cloudinary API key. Your actual API key is `127785712443566`.

## ✅ Solution Steps

### 1. Update Vercel Environment Variables

1. **Login to Vercel Dashboard:**
   - Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Find your LoopWin project

2. **Navigate to Environment Variables:**
   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables" in the sidebar

3. **Update These Variables:**
   ```
   CLOUDINARY_CLOUD_NAME = hanzalascloud
   CLOUDINARY_API_KEY = 127785712443566
   CLOUDINARY_API_SECRET = BJksH_7WrJPbSv4kzt5Vlm-O_P4
   ```

4. **Set Environment Scope:**
   - Make sure to set for: Production, Preview, and Development
   - Check all three checkboxes for each variable

### 2. Redeploy Your Application

After updating the environment variables:

1. **Trigger a new deployment:**
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - OR push a new commit to trigger automatic deployment

### 3. Alternative: Use Vercel CLI

If you have Vercel CLI installed:

```bash
# Add environment variables via CLI
vercel env add CLOUDINARY_CLOUD_NAME
# Enter: hanzalascloud

vercel env add CLOUDINARY_API_KEY  
# Enter: 127785712443566

vercel env add CLOUDINARY_API_SECRET
# Enter: BJksH_7WrJPbSv4kzt5Vlm-O_P4

# Redeploy
vercel --prod
```

## 🔍 Verification Steps

1. **Check deployment logs:**
   - After redeployment, check the function logs in Vercel dashboard
   - Look for any Cloudinary configuration errors

2. **Test the upload endpoint:**
   ```bash
   # Test with a real file upload
   curl -X PATCH \
     "https://loop-win-backend.vercel.app/api/v1/purchases/[PURCHASE_ID]/upload-screenshot" \
     -H "Authorization: Bearer [YOUR_TOKEN]" \
     -F "paymentScreenshot=@screenshot.jpg" \
     -F "transactionId=TEST123"
   ```

## 🛡️ Security Note

- Never commit API secrets to Git
- Use Vercel's environment variables for all sensitive data
- Your current .env file should only be for local development

## 📋 All Required Vercel Environment Variables

Make sure these are all set in Vercel:

```env
# Server Settings
PORT=4000
MONGODB_URI=mongodb+srv://Hanzala:0987654321@project1.mpisi.mongodb.net/loopWin?retryWrites=true&w=majority
CORS_ORIGIN=*

# JWT Settings  
ACCESS_TOKEN_SECRET=@t7vG^P!9b@*Dx#cRQEz8$kW4HZmL=opVjY2N?UqA5sJ!-Xf
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=^P!9b@*Dx#cRQEz8$kW4HZmL=opVjY2N?UqA5sJ!-Xf@t7vG
REFRESH_TOKEN_EXPIRY=30d

# Cloudinary Settings (CRITICAL FOR FILE UPLOAD)
CLOUDINARY_CLOUD_NAME=hanzalascloud
CLOUDINARY_API_KEY=127785712443566
CLOUDINARY_API_SECRET=BJksH_7WrJPbSv4kzt5Vlm-O_P4

# Environment
NODE_ENV=production
```

## 🎯 Quick Fix Summary

1. ✅ Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. ✅ Update `CLOUDINARY_API_KEY` to `127785712443566`
3. ✅ Verify all other Cloudinary variables are correct
4. ✅ Redeploy the application
5. ✅ Test the upload endpoint

This should resolve the `Invalid api_key` error immediately! 🚀
