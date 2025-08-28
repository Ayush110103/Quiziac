# Production Deployment Guide

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.production` file with your production environment variables:

```bash
# Neon Database
NEXT_NEON_DB_API_KEY=postgresql://username:password@hostname/database?sslmode=require

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=https://your-domain.com
```

### 2. Database Setup

Ensure your Neon DB tables are created:

```bash
npm run create-tables
npm run check-tables
```

### 3. Build and Deploy

```bash
# Prepare for production
npm run deploy-prep

# Build the application
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start with docker-compose
npm run docker-compose-up

# Stop services
npm run docker-compose-down
```

### Manual Docker

```bash
# Build Docker image
npm run docker-build

# Run container
npm run docker-run
```

## ☁️ Cloud Platform Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_NEON_DB_API_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
3. Deploy automatically on push to main branch

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Set environment variables in Netlify dashboard

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

## 🔧 Production Optimizations

### Performance

- ✅ Image optimization enabled
- ✅ Compression enabled
- ✅ Security headers configured
- ✅ Bundle analysis available (`npm run analyze`)

### Security

- ✅ XSS protection headers
- ✅ Content type sniffing protection
- ✅ Frame options protection
- ✅ Referrer policy configured

### Monitoring

- ✅ Health check endpoint: `/api/health`
- ✅ Database connection monitoring
- ✅ Error logging configured

## 📊 Health Checks

Monitor your application health:

```bash
# Check application health
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "uptime": 123.456
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `NEXT_NEON_DB_API_KEY` format
   - Verify Neon DB is accessible
   - Run: `npm run test-connection`

2. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain
   - Ensure database tables exist

3. **Build Failures**
   - Check for TypeScript errors: `npm run lint`
   - Verify all dependencies are installed
   - Check Node.js version compatibility

### Logs

```bash
# View application logs
docker logs quiziac

# View nginx logs (if using proxy)
docker logs nginx
```

## 📈 Scaling

### Horizontal Scaling

For high traffic, consider:

1. **Load Balancer**: Use nginx or cloud load balancer
2. **Multiple Instances**: Deploy multiple containers
3. **Database Connection Pooling**: Configure Neon DB connection limits
4. **CDN**: Use Vercel Edge Network or Cloudflare

### Performance Monitoring

- Monitor response times
- Track database query performance
- Set up alerts for health check failures
- Monitor memory and CPU usage

## 🔐 Security Checklist

- [ ] Environment variables are secure
- [ ] Database connection uses SSL
- [ ] NextAuth secret is strong and unique
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] Regular dependency updates
- [ ] Database backups are configured

## 📞 Support

For deployment issues:

1. Check the health endpoint: `/api/health`
2. Review application logs
3. Verify environment variables
4. Test database connection: `npm run test-connection`
5. Check table existence: `npm run check-tables`
