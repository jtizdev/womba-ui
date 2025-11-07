#!/bin/bash

# Womba API Validation Script
# This script tests all the main API endpoints to ensure they're working

API_BASE="http://localhost:8000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "Womba API Validation"
echo "================================"
echo ""

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
        return 1
    fi
}

# Run tests
passed=0
failed=0

# 1. Health check
if test_endpoint "Health Check" "GET" "/health"; then
    ((passed++))
else
    ((failed++))
fi

# 2. Root endpoint
if test_endpoint "Root Endpoint" "GET" "/"; then
    ((passed++))
else
    ((failed++))
fi

# 3. RAG Stats
if test_endpoint "RAG Stats" "GET" "/api/v1/rag/stats"; then
    ((passed++))
else
    ((failed++))
fi

# 4. Stats
if test_endpoint "Statistics" "GET" "/api/v1/stats"; then
    ((passed++))
else
    ((failed++))
fi

# 5. History
if test_endpoint "History" "GET" "/api/v1/history"; then
    ((passed++))
else
    ((failed++))
fi

# 6. Config
if test_endpoint "Config" "GET" "/api/v1/config"; then
    ((passed++))
else
    ((failed++))
fi

# 7. UI Health
if test_endpoint "UI Health" "GET" "/api/v1/health"; then
    ((passed++))
else
    ((failed++))
fi

# 8. RAG Search
if test_endpoint "RAG Search" "POST" "/api/v1/rag/search" '{"query":"test","collection":"jira_stories","top_k":5}'; then
    ((passed++))
else
    ((failed++))
fi

echo ""
echo "================================"
echo "Results:"
echo -e "  ${GREEN}Passed: $passed${NC}"
echo -e "  ${RED}Failed: $failed${NC}"
echo "================================"

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Check the Womba API is running at $API_BASE${NC}"
    exit 1
fi

