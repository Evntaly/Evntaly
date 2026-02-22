# 🧪 Local Testing Guide - Shopify Integration

## Prerequisites

1. **MongoDB** running locally
2. **Node.js** and npm installed
3. **Shopify Partner Account** with development store
4. **ngrok** for webhook testing
5. **Shopify App** created in Partner Dashboard

## 🔧 Environment Setup

Create a `.env.local` file in your project root:

```bash
# Local Development Environment
NODE_ENV=development
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/evntaly-local

# App URL (use ngrok URL for webhooks)
APP_URL=https://your-ngrok-url.ngrok.io

# Shopify App Configuration (from Partner Dashboard)
SHOPIFY_API_KEY=your_app_api_key
SHOPIFY_API_SECRET=your_app_api_secret
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Evntaly API Configuration  
EVNTALY_SECRET=cabe7aeccc545f55
EVNTALY_PAT=ea197d2821039ee1b635823b1c21

# Logging
LOG_LEVEL=debug
```

## 🏪 Shopify App Setup (Partner Dashboard)

### 1. Create Shopify App
1. Go to [Shopify Partner Dashboard](https://partners.shopify.com/)
2. Click "Create App" → "Public App"
3. Fill in app details:
   - **App name**: "Evntaly Analytics"
   - **App URL**: `https://your-ngrok-url.ngrok.io/shopify-setup.html`
   - **Allowed redirection URL(s)**: `https://your-ngrok-url.ngrok.io/api/v1/shopify-auth/callback`

### 2. Configure App Settings
- **Scopes**: `read_orders,read_products,read_customers,write_webhooks`
- **App distribution**: Development store only (for testing)

### 3. Get API Credentials
- Copy **API key** → `SHOPIFY_API_KEY`
- Copy **API secret** → `SHOPIFY_API_SECRET`  
- Generate **Webhook secret** → `SHOPIFY_WEBHOOK_SECRET`

## 🚀 Start Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Start Application
```bash
npm run start:dev
```

### 4. Expose Local Server (for webhooks)
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Copy the HTTPS URL and update APP_URL in .env.local
```

## 🧪 Testing Strategy

### Phase 1: OAuth Flow Testing

#### Test App Installation
```bash
# 1. Visit install URL
https://your-ngrok-url.ngrok.io/api/v1/shopify-auth/install?shop=your-dev-store

# 2. Should redirect to Shopify OAuth
# 3. After approval, redirects to setup page
# 4. Complete Evntaly credentials setup
```

### Phase 2: Proper User Flow (No Manual Tokens!)

#### ✅ Correct Flow:
1. **Merchant visits install URL** → `GET /api/v1/shopify-auth/install?shop=store-name`
2. **Shopify OAuth** → User approves permissions
3. **Callback** → `GET /api/v1/shopify-auth/callback` (automatic)
4. **Setup page** → `shopify-setup.html` (only Evntaly credentials)
5. **Integration complete** → Webhooks registered automatically

#### ❌ Wrong Flow (What we fixed):
```bash
# OLD: Manual access token entry
❌ Merchant enters Shopify access token manually
❌ Technical complexity for merchants
❌ Security risk
```

### Phase 3: API Endpoint Testing

#### Test Admin API Endpoints  
```bash
# Health Check
curl http://localhost:3000/api/v1/admin/shopify/health

# Get Integration (after OAuth setup)
curl http://localhost:3000/api/v1/admin/shopify/integration/test-store.myshopify.com

# Test Integration Credentials
curl -X POST http://localhost:3000/api/v1/admin/shopify/integration/test-store.myshopify.com/test
```

### Phase 4: Webhook Testing

#### Test Webhook Endpoints with Mock Data
```bash
# Test Order Created Webhook
curl -X POST http://localhost:3000/api/v1/hooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Shop-Domain: test-store.myshopify.com" \
  -d @test/fixtures/shopify-order-created.json

# Test Order Updated Webhook  
curl -X POST http://localhost:3000/api/v1/hooks/shopify/orders/updated \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Shop-Domain: test-store.myshopify.com" \
  -d @test/fixtures/shopify-order-updated.json

# Test Checkout Created Webhook
curl -X POST http://localhost:3000/api/v1/hooks/shopify/checkouts/create \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Shop-Domain: test-store.myshopify.com" \
  -d @test/fixtures/shopify-checkout-created.json
```

## 🎯 Test Scenarios

### Scenario 1: Complete Integration Flow
1. **Create Shopify development store**
2. **Set up ngrok**: `ngrok http 3000`
3. **Update environment variables** with ngrok URL
4. **Visit install URL**: `/api/v1/shopify-auth/install?shop=your-store`
5. **Complete OAuth flow**
6. **Fill in Evntaly credentials** on setup page
7. **Verify webhooks registered** in Shopify admin
8. **Test webhook endpoints**

### Scenario 2: Error Handling
1. Test with invalid Shopify app credentials
2. Test with malformed webhook data
3. Test with non-existent shop domain
4. Verify error responses and logging

### Scenario 3: Security Testing
1. Test webhook signature verification
2. Test OAuth state parameter validation
3. Test unauthorized access attempts

## 🔍 Debugging Tools

### View Application Logs
```bash
# Follow logs in real-time
tail -f logs/application.log

# Or use PM2 if running with PM2
pm2 logs evntaly-backend
```

### Monitor Database Changes
```bash
# Connect to MongoDB
mongo evntaly-local

# Check shopify_integrations collection
db.shopify_integrations.find().pretty()

# Watch for new integrations
db.shopify_integrations.find().sort({createdAt: -1}).limit(5)
```

### Network Debugging
```bash
# Monitor webhook calls with ngrok
# Visit: http://localhost:4040/inspect/http
```

## ✅ Testing Checklist

### OAuth Flow
- [ ] Install URL redirects to Shopify
- [ ] OAuth approval works
- [ ] Callback processes correctly
- [ ] Access token obtained and stored
- [ ] Setup page loads with shop info

### Integration Setup
- [ ] Setup form only asks for Evntaly credentials
- [ ] No manual access token entry required
- [ ] Webhook settings configurable
- [ ] Integration saves to database
- [ ] Webhooks registered automatically

### Webhook Processing
- [ ] Order created webhook processes correctly
- [ ] Order updated webhook processes correctly  
- [ ] Checkout created webhook processes correctly
- [ ] Shop domain extraction works
- [ ] Events sent to Evntaly successfully

### Security
- [ ] Webhook signatures verified
- [ ] OAuth state validation works
- [ ] HMAC verification passes
- [ ] Access tokens encrypted in database

## 🚨 Common Issues & Solutions

### Issue: OAuth callback fails
**Solution**: Check SHOPIFY_API_SECRET and callback URL matches Partner Dashboard

### Issue: Webhooks not received
**Solution**: Verify ngrok is running and APP_URL is updated

### Issue: "Invalid callback signature"
**Solution**: Check SHOPIFY_WEBHOOK_SECRET matches Partner Dashboard

### Issue: Setup page not loading
**Solution**: Verify static file serving is configured in main.ts

## 📊 URLs for Testing

### Development URLs:
- **Install**: `https://your-ngrok-url.ngrok.io/api/v1/shopify-auth/install?shop=your-store`
- **Setup**: `https://your-ngrok-url.ngrok.io/shopify-setup.html`
- **Admin**: `https://your-ngrok-url.ngrok.io/shopify-admin.html` (legacy)

### API Endpoints:
- **OAuth Callback**: `GET /api/v1/shopify-auth/callback`
- **Uninstall**: `GET /api/v1/shopify-auth/uninstall`
- **Integration CRUD**: `/api/v1/admin/shopify/integration/*`

## 🎭 Proper Merchant Experience

```
1. 👤 Merchant finds app in Shopify App Store (or dev link)
2. 🔐 Clicks "Install" → Shopify OAuth (automatic)
3. ✅ Approves permissions → Redirected to setup
4. 📝 Enters only Evntaly credentials (secret + PAT)
5. 🎉 Integration complete → Webhooks auto-registered
6. 📊 Events flow to Evntaly dashboard
```

**No technical knowledge required! No manual tokens!** 🚀 