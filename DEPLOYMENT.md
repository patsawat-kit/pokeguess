# Who's That Pokémon? - Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

Vercel is the recommended platform as it's built by the creators of Next.js and provides optimal performance.

### Step-by-Step Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

3. **Custom Domain (Optional)**
   - In Vercel dashboard, go to Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### Environment Variables

No environment variables are required for basic deployment. The app uses:
- `NEXT_PUBLIC_POKEMON_API_URL` (defaults to https://pokeapi.co/api/v2)
- `NEXT_PUBLIC_ENABLE_AUDIO` (defaults to true)

To customize, add these in Vercel dashboard under Settings → Environment Variables.

---

## 🌐 Alternative Deployment Options

### Netlify

1. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

2. **Deploy**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### Railway

1. Create new project on [railway.app](https://railway.app)
2. Connect GitHub repository
3. Railway auto-detects Next.js
4. Deploy automatically

### Cloudflare Pages

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Build output: `.next`
3. Deploy

### Self-Hosted (VPS/Docker)

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Run production server**
   ```bash
   npm start
   ```

3. **Using PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "pokemon-game" -- start
   pm2 save
   pm2 startup
   ```

4. **Using Docker**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

---

## ✅ Pre-Deployment Checklist

- [x] Production build successful (`npm run build`)
- [x] All routes prerendered as static content
- [x] SEO metadata configured
- [x] Favicon/logo added
- [x] README.md updated
- [x] No console errors in production
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Set up analytics (optional)
- [ ] Configure custom domain (optional)

---

## 📊 Performance Optimization

The app is already optimized with:
- ✅ Static site generation (SSG)
- ✅ Code splitting
- ✅ Image optimization
- ✅ Font optimization (Google Fonts)
- ✅ Minified CSS/JS
- ✅ Gzip compression

### Additional Optimizations (Optional)

1. **Add Analytics**
   ```bash
   npm install @vercel/analytics
   ```

2. **Add Error Tracking**
   ```bash
   npm install @sentry/nextjs
   ```

3. **Enable PWA**
   ```bash
   npm install next-pwa
   ```

---

## 🔒 Security Considerations

- ✅ No sensitive data exposed
- ✅ API calls to public PokéAPI only
- ✅ No authentication required
- ✅ Static site (minimal attack surface)

---

## 📈 Post-Deployment

### Monitor Your App

1. **Vercel Analytics** - Built-in performance monitoring
2. **Google Analytics** - Track user engagement
3. **Lighthouse** - Run performance audits

### Share Your App

Update these links in your README:
- Live URL: `https://your-app.vercel.app`
- GitHub: `https://github.com/your-username/whos-that-pokemon`

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Audio Not Working
- Browser autoplay restrictions - users must interact with page first
- Check browser console for errors

### Favicon Not Showing
- Hard refresh browser (Cmd/Ctrl + Shift + R)
- Clear browser cache
- Verify `/public/pokemon-logo.png` exists

---

## 🎉 You're Ready to Deploy!

Your app is production-ready. Choose your preferred platform and deploy!

**Recommended:** Start with Vercel for the easiest deployment experience.
