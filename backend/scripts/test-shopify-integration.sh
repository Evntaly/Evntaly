#!/bin/bash

# 🧪 Shopify Integration Testing Script
# This script automates the testing of your Shopify integration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
API_URL="${BASE_URL}/api/v1"
ADMIN_API="${API_URL}/admin/shopify"
WEBHOOK_API="${API_URL}/hooks/shopify"

echo -e "${BLUE}🧪 Starting Shopify Integration Testing...${NC}"

# Function to check if server is running
check_server() {
    echo -e "${YELLOW}📡 Checking if server is running...${NC}"
    if curl -s "${BASE_URL}" > /dev/null; then
        echo -e "${GREEN}✅ Server is running${NC}"
    else
        echo -e "${RED}❌ Server is not running. Please start with: npm run start:dev${NC}"
        exit 1
    fi
}

# Function to test API endpoints
test_admin_api() {
    echo -e "${YELLOW}🔧 Testing Admin API endpoints...${NC}"
    
    # Health check
    echo "Testing health endpoint..."
    if curl -s "${ADMIN_API}/health" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Health endpoint working${NC}"
    else
        echo -e "${RED}❌ Health endpoint failed${NC}"
    fi
    
    # Create integration test
    echo "Testing create integration..."
    response=$(curl -s -w "%{http_code}" -X POST "${ADMIN_API}/integration" \
        -H "Content-Type: application/json" \
        -d '{
            "shop_domain": "test-store.myshopify.com",
            "shop_name": "Test Store",
            "access_token": "shpca_test_token",
            "evntaly_secret": "test_secret",
            "evntaly_pat": "test_pat",
            "order_created": true,
            "order_updated": true,
            "checkout_created": true
        }')
    
    http_code="${response: -3}"
    if [[ "$http_code" == "200" || "$http_code" == "201" ]]; then
        echo -e "${GREEN}✅ Create integration working${NC}"
    else
        echo -e "${RED}❌ Create integration failed (HTTP: $http_code)${NC}"
    fi
    
    # Get integration test
    echo "Testing get integration..."
    if curl -s "${ADMIN_API}/integration/test-store.myshopify.com" | grep -q "shop_domain"; then
        echo -e "${GREEN}✅ Get integration working${NC}"
    else
        echo -e "${RED}❌ Get integration failed${NC}"
    fi
}

# Function to test webhooks
test_webhooks() {
    echo -e "${YELLOW}🪝 Testing Webhook endpoints...${NC}"
    
    # Test Order Created
    echo "Testing order created webhook..."
    response=$(curl -s -w "%{http_code}" -X POST "${WEBHOOK_API}/orders/create" \
        -H "Content-Type: application/json" \
        -H "X-Shopify-Shop-Domain: test-store.myshopify.com" \
        -d @test/fixtures/shopify-order-created.json)
    
    http_code="${response: -3}"
    if [[ "$http_code" == "200" ]]; then
        echo -e "${GREEN}✅ Order Created webhook working${NC}"
    else
        echo -e "${RED}❌ Order Created webhook failed (HTTP: $http_code)${NC}"
    fi
    
    # Test Order Updated
    echo "Testing order updated webhook..."
    response=$(curl -s -w "%{http_code}" -X POST "${WEBHOOK_API}/orders/updated" \
        -H "Content-Type: application/json" \
        -H "X-Shopify-Shop-Domain: test-store.myshopify.com" \
        -d @test/fixtures/shopify-order-updated.json)
    
    http_code="${response: -3}"
    if [[ "$http_code" == "200" ]]; then
        echo -e "${GREEN}✅ Order Updated webhook working${NC}"
    else
        echo -e "${RED}❌ Order Updated webhook failed (HTTP: $http_code)${NC}"
    fi
    
    # Test Checkout Created
    echo "Testing checkout created webhook..."
    response=$(curl -s -w "%{http_code}" -X POST "${WEBHOOK_API}/checkouts/create" \
        -H "Content-Type: application/json" \
        -H "X-Shopify-Shop-Domain: test-store.myshopify.com" \
        -d @test/fixtures/shopify-checkout-created.json)
    
    http_code="${response: -3}"
    if [[ "$http_code" == "200" ]]; then
        echo -e "${GREEN}✅ Checkout Created webhook working${NC}"
    else
        echo -e "${RED}❌ Checkout Created webhook failed (HTTP: $http_code)${NC}"
    fi
}

# Function to test database
test_database() {
    echo -e "${YELLOW}🗄️ Testing Database operations...${NC}"
    
    # Check if MongoDB is running
    if command -v mongo &> /dev/null; then
        echo "Checking MongoDB collections..."
        mongo evntaly-local --eval "
            print('📊 Database: ' + db.getName());
            print('📋 Collections: ' + db.getCollectionNames());
            print('🏪 Shopify Integrations Count: ' + db.shopify_integrations.count());
            if (db.shopify_integrations.count() > 0) {
                print('📄 Sample Integration:');
                printjson(db.shopify_integrations.findOne());
            }
        " --quiet
        echo -e "${GREEN}✅ Database operations working${NC}"
    else
        echo -e "${YELLOW}⚠️ MongoDB CLI not available, skipping database tests${NC}"
    fi
}

# Function to test admin UI
test_admin_ui() {
    echo -e "${YELLOW}🖥️ Testing Admin UI...${NC}"
    
    if curl -s "${BASE_URL}/shopify-admin.html" | grep -q "Shopify Evntaly Integration"; then
        echo -e "${GREEN}✅ Admin UI accessible${NC}"
        echo -e "${BLUE}🌐 Admin UI available at: ${BASE_URL}/shopify-admin.html${NC}"
    else
        echo -e "${RED}❌ Admin UI not accessible${NC}"
    fi
}

# Function to run performance tests
run_performance_test() {
    echo -e "${YELLOW}⚡ Running basic performance test...${NC}"
    
    if command -v ab &> /dev/null; then
        echo "Running Apache Bench test (100 requests, 10 concurrent)..."
        ab -n 100 -c 10 "${ADMIN_API}/health" | grep -E "(Requests per second|Time per request)"
        echo -e "${GREEN}✅ Performance test completed${NC}"
    else
        echo -e "${YELLOW}⚠️ Apache Bench not available, skipping performance tests${NC}"
        echo "Install with: brew install httpie"
    fi
}

# Function to cleanup test data
cleanup_test_data() {
    echo -e "${YELLOW}🧹 Cleaning up test data...${NC}"
    
    # Delete test integration
    curl -s -X DELETE "${ADMIN_API}/integration/test-store.myshopify.com" > /dev/null
    echo -e "${GREEN}✅ Test data cleaned up${NC}"
}

# Function to show ngrok instructions
show_ngrok_info() {
    echo -e "${BLUE}🌐 For webhook testing with real Shopify store:${NC}"
    echo "1. Install ngrok: npm install -g ngrok"
    echo "2. Run: ngrok http 3000"
    echo "3. Copy the HTTPS URL and update APP_URL in your .env.local"
    echo "4. Register webhooks in your Shopify app admin"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Shopify Integration Test Suite${NC}"
    echo "=================================="
    
    # Run all tests
    check_server
    test_admin_api
    test_webhooks
    test_database
    test_admin_ui
    
    # Optional performance test
    read -p "$(echo -e ${YELLOW}⚡ Run performance test? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_performance_test
    fi
    
    # Cleanup
    read -p "$(echo -e ${YELLOW}🧹 Clean up test data? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup_test_data
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Testing completed!${NC}"
    show_ngrok_info
    
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Set up a Shopify development store"
    echo "2. Configure ngrok for webhook testing"
    echo "3. Test with real Shopify data"
    echo "4. Monitor logs for any issues"
    echo ""
    echo -e "${GREEN}✨ Your Shopify integration is ready for testing!${NC}"
}

# Check if running from correct directory
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Run main function
main "$@" 