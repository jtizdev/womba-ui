# Womba UI - API Integration Guide

## Summary of Changes

All API endpoints have been integrated and tested. The UI is now fully connected to the Womba API running on Docker at `http://localhost:8000`.

## Fixed Issues

### 1. **RAG Stats Structure Mismatch**
- **Problem**: The UI expected `stories` and `test_plans` collections, but the API returns multiple collections
- **Solution**: Updated `RagStats` type to match actual API response with collections:
  - `jira_stories` (was `stories`)
  - `test_plans`
  - `existing_tests`
  - `confluence_docs`
  - `swagger_docs`
  - Plus `total_documents` and `storage_path`

### 2. **Search Collection Name**
- **Problem**: UI was searching `stories` collection
- **Solution**: Changed to search `jira_stories` collection to match API

### 3. **API Response Handling**
- **Problem**: Empty results were causing issues
- **Solution**: Added null/undefined checks and empty array handling

## API Endpoints Status

### ✅ Working Endpoints

1. **GET /health** - Health check
   ```bash
   curl http://localhost:8000/health
   # Response: {"status":"healthy","environment":"production"}
   ```

2. **GET /** - Root endpoint
   ```bash
   curl http://localhost:8000/
   ```

3. **GET /api/v1/rag/stats** - RAG database statistics
   ```bash
   curl http://localhost:8000/api/v1/rag/stats
   ```

4. **GET /api/v1/stats** - Test generation statistics
   ```bash
   curl http://localhost:8000/api/v1/stats
   ```

5. **GET /api/v1/history** - Test generation history
   ```bash
   curl http://localhost:8000/api/v1/history
   ```

6. **GET /api/v1/config** - Configuration
   ```bash
   curl http://localhost:8000/api/v1/config
   ```

7. **POST /api/v1/rag/search** - Search RAG database
   ```bash
   curl -X POST http://localhost:8000/api/v1/rag/search \
     -H "Content-Type: application/json" \
     -d '{"query": "test", "collection": "jira_stories", "top_k": 5}'
   ```

8. **POST /api/v1/rag/index** - Index a story
   ```bash
   curl -X POST http://localhost:8000/api/v1/rag/index \
     -H "Content-Type: application/json" \
     -d '{"story_key": "PROJ-123", "project_key": "PROJ"}'
   ```

9. **POST /api/v1/rag/index/batch** - Batch index tests
   ```bash
   curl -X POST "http://localhost:8000/api/v1/rag/index/batch?project_key=PROJ&max_tests=100"
   ```

10. **DELETE /api/v1/rag/clear** - Clear collections
    ```bash
    curl -X DELETE "http://localhost:8000/api/v1/rag/clear?collection=test_plans"
    ```

11. **POST /api/v1/test-plans/generate** - Generate test plan
    ```bash
    curl -X POST http://localhost:8000/api/v1/test-plans/generate \
      -H "Content-Type: application/json" \
      -d '{"issue_key": "PROJ-123", "upload_to_zephyr": false}'
    ```

12. **POST /api/v1/config** - Save configuration
13. **POST /api/v1/config/validate** - Validate configuration

## UI Features Implemented

### 1. Test Generation Page
- Search for Jira stories
- Generate test plans
- Optional Zephyr upload with project key and folder ID
- View and edit generated test cases
- Bulk upload to Zephyr

### 2. RAG Management Page
- View RAG database statistics (all collections)
- Index individual stories
- Batch index tests from Zephyr
- Search RAG database (all collections)
- Clear collections (with confirmation)

### 3. Configuration Page
- Atlassian configuration (URL, email, API token)
- Zephyr API token
- OpenAI API key
- AI model selection
- Automation settings
- Validation for each service

### 4. Statistics Page
- Overview metrics (total tests, stories, time saved, success rate)
- Weekly metrics
- Test generation history with filtering
- Pagination and load more

## Testing the Integration

### Option 1: Use the Test Page
1. Open http://localhost:8001/test-api.html in your browser
2. Ensure API URL is set to `http://localhost:8000`
3. Click "Run All Tests"
4. Review results for each endpoint

### Option 2: Use the UI
1. Start the Womba API (Docker):
   ```bash
   # Assuming Docker is already running
   # API should be available at http://localhost:8000
   ```

2. Start the UI development server:
   ```bash
   cd /Users/royregev/git/womba-ui
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

4. Test each feature:
   - **Test Generation**: Search for a story, generate tests, upload to Zephyr
   - **RAG Management**: View stats, search database, index stories
   - **Configuration**: Set up API keys and settings
   - **Statistics**: View metrics and history

### Option 3: Manual API Testing
Use the curl commands above to test each endpoint individually.

## Environment Configuration

Create a `.env.local` file (optional, defaults to localhost:8000):
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Common Issues and Solutions

### Issue: "Failed to fetch" or CORS errors
**Solution**: Ensure the Womba API is running and configured to allow CORS from localhost:3000

### Issue: Empty search results
**Solution**: The RAG database needs to be populated first. Use the batch index feature to index existing tests.

### Issue: "Failed to generate test plan"
**Solution**: Ensure you're using a valid Jira issue key that exists in your Jira instance.

### Issue: Config validation fails
**Solution**: Check that your API tokens and credentials are correct.

## API Response Structures

### RAG Stats Response
```json
{
  "test_plans": {"name": "test_plans", "count": 9, "exists": true},
  "jira_stories": {"name": "jira_stories", "count": 10562, "exists": true},
  "existing_tests": {"name": "existing_tests", "count": 16036, "exists": true},
  "confluence_docs": {"name": "confluence_docs", "count": 4893, "exists": true},
  "swagger_docs": {"name": "swagger_docs", "count": 64, "exists": true},
  "external_docs": {"name": "external_docs", "count": 287, "exists": true},
  "total_documents": 31851,
  "storage_path": "data/chroma"
}
```

### Stats Response
```json
{
  "total_tests": 0,
  "total_stories": 0,
  "time_saved": 0,
  "success_rate": 100.0,
  "tests_this_week": 0,
  "stories_this_week": 0
}
```

### Config Response
```json
{
  "atlassian_url": null,
  "atlassian_email": null,
  "project_key": null,
  "ai_model": "gpt-4o",
  "repo_path": null,
  "git_provider": "auto",
  "default_branch": "master",
  "auto_upload": false,
  "auto_create_pr": true,
  "ai_tool": "aider"
}
```

## Next Steps

1. **Populate RAG Database**: Use the batch index feature to populate the RAG database with existing test data
2. **Configure API Keys**: Set up your Atlassian, Zephyr, and OpenAI API keys in the Configuration page
3. **Test Generation**: Try generating test plans for real Jira stories
4. **Monitor Statistics**: Check the Statistics page to track your test generation activity

## Files Modified

1. `services/testCaseService.ts` - All API calls enabled and fixed
2. `types.ts` - Updated types to match actual API responses
3. `components/RagManagementPage.tsx` - Fixed collection names and added more stats
4. `components/ConfigPage.tsx` - New configuration page
5. `components/StatsPage.tsx` - New statistics page
6. `components/JiraSearchPage.tsx` - Added Zephyr upload options
7. `components/TestPlanPage.tsx` - Implemented real Zephyr upload
8. `components/Nav.tsx` - Added new navigation items
9. `components/icons.tsx` - Added missing icons
10. `App.tsx` - Added routing for new pages
11. `vite.config.ts` - Added API URL environment variable support

All endpoints have been tested and are working correctly with the Womba API running in Docker.

