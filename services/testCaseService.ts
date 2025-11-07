import { TestCase, JiraStory, RagStats } from '../types';

const API_BASE_URL = 'http://localhost:8000'; // As per API spec for development

const mockJiraStories: JiraStory[] = [
    { id: 'PROJ-123', title: 'Add user authentication feature', description: 'Implement OAuth2 authentication...' },
    { id: 'PROJ-124', title: 'Implement "Add to Cart" functionality', description: 'Users should be able to add products to their shopping cart from the product detail page.' },
    { id: 'PROJ-125', title: 'Develop the main dashboard page', description: 'The dashboard should show key metrics and recent activity.' },
    { id: 'PROJ-126', title: 'User Profile Page UI/UX', description: 'Design and implement the user profile page where users can update their information.' },
];

/**
 * Searches for Jira stories.
 * This function is designed to call the `POST /api/v1/rag/search` endpoint.
 *
 * @param query The search query string.
 * @returns A promise that resolves to an array of JiraStory objects.
 */
export const searchJiraStories = async (query: string): Promise<JiraStory[]> => {
    console.log(`Searching for Jira stories with query: "${query}"`);
    /*
        // REAL API CALL:
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, collection: 'stories', top_k: 5 })
        });
        if (!response.ok) {
            throw new Error('Failed to search stories');
        }
        const data = await response.json();
        // NOTE: The mapping below assumes the structure of the RAG search result metadata.
        return data.results.map((result: any) => ({
            id: result.metadata.key,
            title: result.metadata.summary,
            description: result.metadata.description || '',
        }));
    */

    // MOCK IMPLEMENTATION FOR DEMO:
    return new Promise(resolve => {
        setTimeout(() => {
            if (!query) return resolve([]);
            const lowerCaseQuery = query.toLowerCase();
            const results = mockJiraStories.filter(
                story => story.id.toLowerCase().includes(lowerCaseQuery) || story.title.toLowerCase().includes(lowerCaseQuery)
            );
            resolve(results);
        }, 300);
    });
};

const formatSteps = (steps: Array<{ step_number: number; action: string; expected_result: string }>): string => {
    return steps.map(step => `${step.step_number}. ${step.action}\n   Expected Result: ${step.expected_result}`).join('\n\n');
};

/**
 * Generates a test plan for a given Jira story issue key.
 * This function is designed to call the `POST /api/v1/test-plans/generate` endpoint.
 *
 * @param issueKey The Jira issue key (e.g., "PROJ-123").
 * @returns A promise that resolves to an array of TestCase objects.
 */
export const generateTestPlan = async (issueKey: string): Promise<TestCase[]> => {
    console.log(`Generating test plan for story: ${issueKey}`);
    /*
        // REAL API CALL:
        const response = await fetch(`${API_BASE_URL}/api/v1/test-plans/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ issue_key: issueKey, upload_to_zephyr: false })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to generate test plan' }));
            throw new Error(error.message || 'Failed to generate test plan');
        }
        const data = await response.json();
        const apiTestCases = data.test_plan.test_cases;

        return apiTestCases.map((tc: any, index: number) => ({
            id: `TC-${issueKey}-${index + 1}`, // Generate a client-side unique ID
            title: tc.title,
            steps: `${tc.description ? tc.description + '\n\n---\n\n' : ''}${formatSteps(tc.steps)}`,
            isSelected: true,
            isExpanded: true,
        }));
    */

    // MOCK IMPLEMENTATION FOR DEMO:
    const mockApiResponse = {
        test_plan: {
            test_cases: [
                { title: "Verify user login with valid credentials", description: "This test ensures a registered user can log in.", steps: [{ step_number: 1, action: "Navigate to login page", expected_result: "Login form is displayed" }, { step_number: 2, action: "Enter valid username and password", expected_result: "Fields are filled" }, { step_number: 3, action: "Click 'Login'", expected_result: "User is redirected to the dashboard" }] },
                { title: "Verify user login with invalid password", description: "This test checks for the correct error on invalid password.", steps: [{ step_number: 1, action: "Navigate to login page", expected_result: "Login form is displayed" }, { step_number: 2, action: "Enter valid username and invalid password", expected_result: "Fields are filled" }, { step_number: 3, action: "Click 'Login'", expected_result: "An 'Invalid credentials' error is shown" }] },
                { title: "Verify 'Remember Me' functionality", description: "Checks if the 'Remember Me' checkbox keeps the user logged in.", steps: [{ step_number: 1, action: "Navigate to login, check 'Remember Me', and log in", expected_result: "User is logged in" }, { step_number: 2, action: "Close and reopen the browser", expected_result: "Browser is reopened" }, { step_number: 3, action: "Navigate to the app URL", expected_result: "User is still logged in and on the dashboard" }] },
                { title: "Verify password reset link request", description: "Ensures users can request a password reset link.", steps: [{ step_number: 1, action: "Navigate to login page and click 'Forgot Password'", expected_result: "Password reset page is displayed" }, { step_number: 2, action: "Enter registered email and submit", expected_result: "A confirmation message is shown" }, { step_number: 3, action: "Check user's email inbox", expected_result: "A password reset email is received" }] },
            ],
        }
    };
    
    return new Promise(resolve => {
        setTimeout(() => {
            const testCases = mockApiResponse.test_plan.test_cases.map((tc, index) => ({
                id: `TC-${issueKey}-${index + 1}`,
                title: tc.title,
                steps: `${tc.description ? tc.description + '\n\n---\n\n' : ''}${formatSteps(tc.steps)}`,
                isSelected: true,
                isExpanded: true,
            }));
            resolve(testCases);
        }, 2000);
    });
};

/**
 * Uploads a set of test cases.
 * NOTE: No direct endpoint was found in the API spec for uploading reviewed/modified test cases.
 * This function remains a mock. A real implementation might involve a different endpoint
 * or re-generating the plan with the `upload_to_zephyr` flag set to true.
 *
 * @param cases An array of TestCase objects to upload.
 * @returns A promise that resolves to an object indicating success.
 */
export const uploadTestCases = (cases: TestCase[]): Promise<{ success: boolean }> => {
  console.log('Uploading test cases:', cases.map(c => c.title));
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Upload successful.');
      resolve({ success: true });
    }, 2000);
  });
};

// --- RAG Management Service Functions ---

/**
 * Fetches RAG database statistics.
 * Calls `GET /api/v1/rag/stats`.
 */
export const getRagStats = async (): Promise<RagStats> => {
    console.log('Fetching RAG stats');
    /*
        // REAL API CALL:
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch RAG stats');
        }
        return response.json();
    */
    const mockStats: RagStats = {
        test_plans: { count: 150, collections: ["test_plans"] },
        stories: { count: 200, collections: ["stories"] }
    };
    return new Promise(resolve => setTimeout(() => resolve(mockStats), 500));
};

/**
 * Indexes a single story into the RAG database.
 * Calls `POST /api/v1/rag/index`.
 */
export const indexStory = async (storyKey: string, projectKey: string): Promise<any> => {
    console.log(`Indexing story ${storyKey} for project ${projectKey}`);
    /*
        // REAL API CALL:
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/index`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ story_key: storyKey, project_key: projectKey })
        });
        if (!response.ok) {
            throw new Error('Failed to index story');
        }
        return response.json();
    */
    return new Promise(resolve => setTimeout(() => resolve({ status: 'success', message: `Successfully indexed ${storyKey}` }), 1500));
};

/**
 * Batch indexes tests from Zephyr.
 * Calls `POST /api/v1/rag/index/batch`.
 */
export const batchIndexTests = async (projectKey: string, maxTests: number): Promise<any> => {
    console.log(`Batch indexing ${maxTests} tests for project ${projectKey}`);
    /*
        // REAL API CALL:
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/index/batch?project_key=${projectKey}&max_tests=${maxTests}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to start batch index');
        }
        return response.json();
    */
    return new Promise(resolve => setTimeout(() => resolve({ status: 'success', message: `Successfully indexed 150 tests`, tests_indexed: 150 }), 3000));
};

/**
 * Clears a RAG collection.
 * Calls `DELETE /api/v1/rag/clear`.
 */
export const clearRagCollection = async (collection: string): Promise<any> => {
    console.log(`Clearing RAG collection: ${collection}`);
    /*
        // REAL API CALL:
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/clear?collection=${collection}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to clear collection');
        }
        return response.json();
    */
    return new Promise(resolve => setTimeout(() => resolve({ status: 'success', message: `Cleared collection: ${collection}` }), 1000));
};
