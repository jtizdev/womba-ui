# Womba API Endpoints Reference

Complete list of API endpoints used by the Womba UI. Use these for direct API testing with `curl` or any HTTP client.

**Base URL:** `http://localhost:8000` (when running in Docker)

---

## Health & Status

### Health Check
```bash
GET /health
```

**Example:**
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{"status":"healthy","environment":"production"}
```

---

## Stories

### Get Story by Key
```bash
GET /api/v1/stories/{issueKey}
```

**Example:**
```bash
curl http://localhost:8000/api/v1/stories/PLAT-12345
```

### Search Stories
```bash
POST /api/v1/stories/search
Content-Type: application/json

{
  "query": "PLAT-12345",
  "max_results": 100
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/stories/search \
  -H "Content-Type: application/json" \
  -d '{"query": "PLAT-12345", "max_results": 100}'
```

---

## Test Plans

### Generate Test Plan
```bash
POST /api/v1/test-plans/generate
Content-Type: application/json

{
  "issue_key": "PLAT-12345",
  "upload_to_zephyr": false,
  "project_key": "PROJ",
  "folder_id": "optional-folder-id"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/test-plans/generate \
  -H "Content-Type: application/json" \
  -d '{
    "issue_key": "PLAT-12345",
    "upload_to_zephyr": false
  }'
```

**Response:**
```json
{
  "test_plan": {
    "metadata": {...},
    "test_cases": [...]
  },
  "zephyr_results": null
}
```

---

## Zephyr Integration

### Upload Test Cases to Zephyr
```bash
POST /api/v1/zephyr/upload
Content-Type: application/json

{
  "issue_key": "PLAT-12345",
  "project_key": "PROJ",
  "folder_id": "optional-folder-id",
  "test_cases": [
    {
      "id": "TC-1",
      "title": "Test case title",
      "description": "Test description",
      "preconditions": "...",
      "expected_result": "...",
      "priority": "Medium",
      "test_type": "Test Case",
      "tags": [],
      "steps": [...]
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/zephyr/upload \
  -H "Content-Type: application/json" \
  -d '{
    "issue_key": "PLAT-12345",
    "project_key": "PROJ",
    "test_cases": [...]
  }'
```

---

## RAG (Retrieval-Augmented Generation)

### Get RAG Statistics
```bash
GET /api/v1/rag/stats
```

**Example:**
```bash
curl http://localhost:8000/api/v1/rag/stats
```

**Response:**
```json
{
  "test_plans": 150,
  "stories": 45,
  "confluence_docs": 200
}
```

### Index Single Story
```bash
POST /api/v1/rag/index
Content-Type: application/json

{
  "story_key": "PLAT-12345",
  "project_key": "PROJ"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/rag/index \
  -H "Content-Type: application/json" \
  -d '{
    "story_key": "PLAT-12345",
    "project_key": "PROJ"
  }'
```

### Batch Index Tests
```bash
POST /api/v1/rag/index/batch?project_key=PROJ&max_tests=100
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/rag/index/batch?project_key=PROJ&max_tests=100"
```

### Index All Tests
```bash
POST /api/v1/rag/index/batch?project_key=PROJ&max_tests=100000
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/rag/index/batch?project_key=PROJ&max_tests=100000"
```

### Clear RAG Collection
```bash
DELETE /api/v1/rag/clear?collection=test_plans
```

**Example:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/rag/clear?collection=test_plans"
```

**Available collections:**
- `test_plans`
- `stories`
- `confluence_docs`

### Search RAG Database
```bash
POST /api/v1/rag/search
Content-Type: application/json

{
  "query": "authentication workflow",
  "collection": "test_plans",
  "top_k": 10,
  "project_key": "PROJ"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "authentication workflow",
    "collection": "test_plans",
    "top_k": 10
  }'
```

---

## Configuration

### Get Configuration
```bash
GET /api/v1/config
```

**Example:**
```bash
curl http://localhost:8000/api/v1/config
```

### Save Configuration
```bash
POST /api/v1/config
Content-Type: application/json

{
  "atlassian_url": "https://yourcompany.atlassian.net",
  "atlassian_email": "user@example.com",
  "atlassian_api_token": "...",
  "zephyr_api_token": "...",
  "openai_api_key": "...",
  "project_key": "PROJ",
  "ai_model": "gpt-4o"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/config \
  -H "Content-Type: application/json" \
  -d '{
    "atlassian_url": "https://yourcompany.atlassian.net",
    "atlassian_email": "user@example.com",
    "project_key": "PROJ"
  }'
```

### Validate Configuration
```bash
POST /api/v1/config/validate
Content-Type: application/json

{
  "service": "jira",
  "atlassian_url": "https://yourcompany.atlassian.net",
  "atlassian_api_token": "..."
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/config/validate \
  -H "Content-Type: application/json" \
  -d '{
    "service": "jira",
    "atlassian_url": "https://yourcompany.atlassian.net",
    "atlassian_api_token": "your-token"
  }'
```

**Services:** `jira`, `zephyr`, `openai`

---

## Statistics & History

### Get Statistics
```bash
GET /api/v1/stats
```

**Example:**
```bash
curl http://localhost:8000/api/v1/stats
```

**Response:**
```json
{
  "total_tests": 500,
  "total_stories": 100,
  "time_saved": 200,
  "success_rate": 95.5,
  "tests_this_week": 50,
  "stories_this_week": 10
}
```

### Get History
```bash
GET /api/v1/history?limit=50&offset=0
```

**Example:**
```bash
curl "http://localhost:8000/api/v1/history?limit=50&offset=0"
```

### Get History Details
```bash
GET /api/v1/history/{id}
```

**Example:**
```bash
curl http://localhost:8000/api/v1/history/hist_1
```

---

## Prompts (Advanced)

### Get Prompt Sections
```bash
GET /api/v1/prompts/sections
```

### Get Company Overview Prompt
```bash
GET /api/v1/prompts/company-overview
```

### Update Company Overview Prompt
```bash
PUT /api/v1/prompts/company-overview
Content-Type: application/json

{
  "content": "Your company overview text..."
}
```

**Example:**
```bash
curl -X PUT http://localhost:8000/api/v1/prompts/company-overview \
  -H "Content-Type: application/json" \
  -d '{"content": "Your company overview text..."}'
```

### Get Full Prompt
```bash
GET /api/v1/prompts/full
```

### Get Prompt Section by ID
```bash
GET /api/v1/prompts/sections/{sectionId}
```

### Update Prompt Section
```bash
PUT /api/v1/prompts/sections/{sectionId}
Content-Type: application/json

{
  "content": "Updated section content..."
}
```

**Example:**
```bash
curl -X PUT http://localhost:8000/api/v1/prompts/sections/section-id \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated section content..."}'
```

### Reset Prompts to Default
```bash
POST /api/v1/prompts/reset
```

---

## Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

API_BASE="http://localhost:8000"

echo "Testing Womba API..."
echo ""

echo "1. Health Check:"
curl -s "$API_BASE/health" | jq .
echo ""

echo "2. RAG Stats:"
curl -s "$API_BASE/api/v1/rag/stats" | jq .
echo ""

echo "3. Statistics:"
curl -s "$API_BASE/api/v1/stats" | jq .
echo ""

echo "4. Generate Test Plan (PLAT-12345):"
curl -s -X POST "$API_BASE/api/v1/test-plans/generate" \
  -H "Content-Type: application/json" \
  -d '{"issue_key": "PLAT-12345"}' | jq .
```

Make it executable:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Notes

- All endpoints require the API to be running (Docker or local)
- Replace `localhost:8000` with your actual API URL if different
- For production/cloud: use `https://your-api-domain.com`
- Most POST requests require `Content-Type: application/json` header
- Check `/docs` endpoint for interactive API documentation: `http://localhost:8000/docs`

