import { TestCase, JiraStory, RagStats, GenerateTestPlanResponse, Config, Stats, HistoryItem, RagSearchResult } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const formatSteps = (steps: Array<{ step_number: number; action: string; expected_result: string }>): string => {
    return steps.map(step => `${step.step_number}. ${step.action}\n   Expected Result: ${step.expected_result}`).join('\n\n');
};

/**
 * Searches for Jira stories.
 * This function calls the `POST /api/v1/rag/search` endpoint.
 *
 * @param query The search query string.
 * @returns A promise that resolves to an array of JiraStory objects.
 */
export const searchJiraStories = async (query: string): Promise<JiraStory[]> => {
    console.log(`Searching for Jira stories with query: "${query}"`);
    console.log(`API Base URL: ${API_BASE_URL}`);
    
    try {
        // Check if query looks like an exact issue key (e.g., "PLAT-13541")
        const issueKeyPattern = /^[A-Z]+-\d+$/;
        const isExactKey = issueKeyPattern.test(query.trim().toUpperCase());
        
        // If it's an exact key, try to fetch it directly first
        if (isExactKey) {
            const issueKey = query.trim().toUpperCase();
            try {
                const directResponse = await fetch(`${API_BASE_URL}/api/v1/stories/${issueKey}`);
                if (directResponse.ok) {
                    const story = await directResponse.json();
                    console.log(`Found exact match for ${issueKey}`);
                    return [{
                        id: story.key,
                        title: story.summary || 'No title',
                        description: story.description || '',
                        updated: story.updated || '',
                    }];
                }
            } catch (e) {
                console.log(`Direct fetch failed for ${issueKey}, falling back to RAG search`);
            }
        }
        
        // Fall back to stories search endpoint
        // Smart query enhancement: if query is just numbers, assume it's a story ID
        let enhancedQuery = query.trim();
        if (/^\d+$/.test(enhancedQuery)) {
            // If it's just numbers, add common project prefix to help semantic search
            enhancedQuery = `PLAT-${enhancedQuery} ${enhancedQuery}`;
            console.log(`Enhanced number query to: "${enhancedQuery}"`);
        }
        
            const url = `${API_BASE_URL}/api/v1/stories/search`;
            // Request up to 100 story results (filtered, sorted by last modified DESC)
            const body = JSON.stringify({ 
                query: enhancedQuery, 
                max_results: 100
            });
        
        console.log(`Making request to: ${url}`);
        console.log(`Request body:`, body);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Search failed with status ${response.status}:`, errorText);
            throw new Error(`Search failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`Search response:`, data);
        
        // Map the stories search results to JiraStory format
        if (!data.results || data.results.length === 0) {
            console.log('No results found in search response');
            return [];
        }
        
        const mappedResults = data.results.map((result: any) => {
            return {
                id: result.key,
                title: result.title,
                description: result.description || '',
                updated: result.updated || '',
            };
        });
        
        // If searching for exact key, prioritize exact matches
        if (isExactKey) {
            const exactMatch = mappedResults.find(r => r.id === query.trim().toUpperCase());
            if (exactMatch) {
                // Move exact match to front
                const otherResults = mappedResults.filter(r => r.id !== query.trim().toUpperCase());
                return [exactMatch, ...otherResults];
            }
        }
        
        console.log(`Mapped ${mappedResults.length} results`);
        return mappedResults;
    } catch (error) {
        console.error('Failed to search stories:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(`Network error: Cannot connect to API at ${API_BASE_URL}. Is the server running?`);
        }
        throw error;
    }
};

/**
 * Generates a test plan for a given Jira story issue key.
 * This function calls the `POST /api/v1/test-plans/generate` endpoint.
 *
 * @param issueKey The Jira issue key (e.g., "PROJ-123").
 * @param uploadToZephyr Whether to upload to Zephyr.
 * @param projectKey Project key for Zephyr upload.
 * @param folderId Optional Zephyr folder ID.
 * @returns A promise that resolves to an array of TestCase objects.
 */
export const generateTestPlan = async (
    issueKey: string, 
    uploadToZephyr: boolean = false,
    projectKey?: string,
    folderId?: string
): Promise<{ testCases: TestCase[], zephyrResults?: any }> => {
    console.log(`Generating test plan for story: ${issueKey}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/test-plans/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                issue_key: issueKey, 
                upload_to_zephyr: uploadToZephyr,
                project_key: projectKey,
                folder_id: folderId
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to generate test plan' }));
            throw new Error(error.detail || 'Failed to generate test plan');
        }
        
        const data: GenerateTestPlanResponse = await response.json();
        const apiTestCases = data.test_plan.test_cases;

        const testCases = apiTestCases.map((tc: any, index: number) => ({
            id: `TC-${issueKey}-${index + 1}`,
            title: tc.title,
            description: tc.description,
            preconditions: tc.preconditions,
            expected_result: tc.expected_result,
            priority: tc.priority,
            test_type: tc.test_type,
            tags: tc.tags,
            steps: `${tc.description ? tc.description + '\n\n---\n\n' : ''}${formatSteps(tc.steps)}`,
            stepsArray: tc.steps,  // Store structured steps
            isSelected: true,
            isExpanded: true,
        }));

        return {
            testCases,
            zephyrResults: data.zephyr_results
        };
    } catch (error) {
        console.error('Failed to generate test plan:', error);
        throw error;
    }
};

/**
 * Uploads test cases to Zephyr.
 * Re-generates the test plan with upload_to_zephyr flag.
 *
 * @param issueKey The Jira issue key.
 * @param cases An array of TestCase objects to upload.
 * @param projectKey Project key for Zephyr.
 * @param folderId Optional folder ID.
 * @returns A promise that resolves to an object indicating success and Zephyr results.
 */
export const uploadTestCases = async (
    issueKey: string,
    cases: TestCase[],
    projectKey: string,
    folderId?: string
): Promise<{ success: boolean; zephyr_results?: any }> => {
    console.log('Uploading test cases to Zephyr:', cases.map(c => c.title));
    
    try {
        // Call the new dedicated Zephyr upload endpoint with selected test cases
        const response = await fetch(`${API_BASE_URL}/api/v1/zephyr/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                issue_key: issueKey,
                project_key: projectKey,
                test_cases: cases.map(tc => ({
                    id: tc.id,
                    title: tc.title,
                    description: tc.description,
                    preconditions: tc.preconditions,
                    expected_result: tc.expected_result,
                    priority: tc.priority,
                    test_type: tc.test_type,
                    tags: tc.tags,
                    steps: tc.stepsArray || []
                })),
                folder_id: folderId // Pass folder_id if provided
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload test cases: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        return {
            success: data.success,
            zephyr_results: {
                test_case_ids: data.test_case_ids,
                uploaded_count: data.uploaded_count,
                ...data.zephyr_results
            }
        };
    } catch (error) {
        console.error('Failed to upload test cases:', error);
        throw error;
    }
};

// --- RAG Management Service Functions ---

/**
 * Fetches RAG database statistics.
 * Calls `GET /api/v1/rag/stats`.
 */
export const getRagStats = async (): Promise<RagStats> => {
    console.log('Fetching RAG stats');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/stats`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch RAG stats');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to fetch RAG stats:', error);
        throw error;
    }
};

/**
 * Indexes a single story into the RAG database.
 * Calls `POST /api/v1/rag/index`.
 */
export const indexStory = async (storyKey: string, projectKey: string): Promise<any> => {
    console.log(`Indexing story ${storyKey} for project ${projectKey}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/index`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ story_key: storyKey, project_key: projectKey })
        });
        
        if (!response.ok) {
            throw new Error('Failed to index story');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to index story:', error);
        throw error;
    }
};

/**
 * Batch indexes tests from Zephyr.
 * Calls `POST /api/v1/rag/index/batch`.
 */
export const batchIndexTests = async (projectKey: string, maxTests: number): Promise<any> => {
    console.log(`Batch indexing ${maxTests} tests for project ${projectKey}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/index/batch?project_key=${projectKey}&max_tests=${maxTests}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to start batch index');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to batch index:', error);
        throw error;
    }
};

/**
 * Index all available tests and stories (no limit).
 * This may take a long time depending on data volume.
 */
export const indexAll = async (projectKey: string): Promise<any> => {
    console.log(`Indexing all data for project ${projectKey}`);
    
    try {
        // Use the proper index-all endpoint that indexes everything (tests + stories + confluence + external docs + swagger)
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/index/all?project_key=${projectKey}&force=true`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to start index-all');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to index all:', error);
        throw error;
    }
};

/**
 * Clears a RAG collection.
 * Calls `DELETE /api/v1/rag/clear`.
 */
export const clearRagCollection = async (collection: string): Promise<any> => {
    console.log(`Clearing RAG collection: ${collection}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/rag/clear?collection=${collection}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear collection');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to clear collection:', error);
        throw error;
    }
};

/**
 * Searches the RAG database.
 * Calls `POST /api/v1/rag/search`.
 */
export const searchRag = async (
    query: string,
    collection: string = 'test_plans',
    topK: number = 10,
    projectKey?: string
): Promise<RagSearchResult[]> => {
    console.log(`Searching RAG: ${query}`);
    
    try {
        const body: any = { query, collection, top_k: topK };
        if (projectKey) {
            body.project_key = projectKey;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/rag/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to search RAG: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        // Map API response to UI format
        // API returns results with 'similarity' field, UI expects 'score'
        if (!data.results || !Array.isArray(data.results)) {
            console.warn('Invalid search response format:', data);
            return [];
        }
        
        return data.results.map((result: any) => ({
            document: result.document || '',
            metadata: result.metadata || {},
            // API returns 'similarity' (0-1), convert to 'score' for UI
            score: result.similarity !== undefined ? result.similarity : (result.score !== undefined ? result.score : (result.distance !== undefined ? 1 - result.distance : 0))
        }));
    } catch (error) {
        console.error('Failed to search RAG:', error);
        throw error;
    }
};

// --- Configuration Service Functions ---

/**
 * Gets the current configuration.
 * Calls `GET /api/v1/config`.
 */
export const getConfig = async (): Promise<Config> => {
    console.log('Fetching config');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/config`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch config');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to fetch config:', error);
        throw error;
    }
};

/**
 * Saves the configuration.
 * Calls `POST /api/v1/config`.
 */
export const saveConfig = async (config: any): Promise<any> => {
    console.log('Saving config');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save config');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to save config:', error);
        throw error;
    }
};

/**
 * Validates configuration settings.
 * Calls `POST /api/v1/config/validate`.
 */
export const validateConfig = async (service: string, config: any): Promise<{ valid: boolean; message: string }> => {
    console.log(`Validating ${service} config`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/config/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service, ...config })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Validation failed' }));
            return { valid: false, message: error.detail || 'Validation failed' };
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to validate config:', error);
        return { valid: false, message: String(error) };
    }
};

// --- Statistics and History Service Functions ---

/**
 * Gets statistics.
 * Calls `GET /api/v1/stats`.
 */
export const getStats = async (): Promise<Stats> => {
    console.log('Fetching stats');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/stats`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        throw error;
    }
};

/**
 * Gets test generation history.
 * Calls `GET /api/v1/history`.
 */
export const getHistory = async (limit: number = 50, offset: number = 0): Promise<HistoryItem[]> => {
    console.log('Fetching history');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/history?limit=${limit}&offset=${offset}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to fetch history:', error);
        throw error;
    }
};

/**
 * Get detailed test plan for a specific history item.
 * Calls `GET /api/v1/history/{id}`.
 */
export const getHistoryDetails = async (id: string): Promise<HistoryItem> => {
    console.log(`Fetching history details for ID: ${id}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/history/${id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch history details');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to fetch history details:', error);
        throw error;
    }
};

/**
 * Gets an existing test plan.
 * Calls `GET /api/v1/test-plans/{issue_key}`.
 */
export const getTestPlan = async (issueKey: string): Promise<any> => {
    console.log(`Fetching test plan for ${issueKey}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/test-plans/${issueKey}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch test plan');
        }
        
        return response.json();
    } catch (error) {
        console.error('Failed to fetch test plan:', error);
        throw error;
    }
};

/**
 * Updates an existing test plan.
 * Calls `PUT /api/v1/test-plans/{issue_key}`.
 * 
 * @param issueKey The Jira issue key (e.g., "PLAT-13541").
 * @param testCases Array of test cases to update the plan with.
 * @param uploadToZephyr Whether to upload to Zephyr after update.
 * @param projectKey Project key for Zephyr upload.
 * @returns A promise that resolves to the updated test plan.
 */
export const updateTestPlan = async (
    issueKey: string,
    testCases: TestCase[],
    uploadToZephyr: boolean = false,
    projectKey?: string
): Promise<{ test_plan: any; zephyr_results?: any; message: string }> => {
    console.log(`Updating test plan for ${issueKey} with ${testCases.length} test cases`);
    
    try {
        // Convert TestCase objects to the format expected by the API
        const testCasesPayload = testCases.map(tc => {
            // Parse steps if it's a string, otherwise use stepsArray
            let stepsArray = tc.stepsArray || [];
            
            // If we have a steps string but no stepsArray, try to parse it
            if (typeof tc.steps === 'string' && tc.steps.trim() && (!tc.stepsArray || tc.stepsArray.length === 0)) {
                // Try to parse steps from string format (e.g., "1. Action\n   Expected: Result\n\n2. Action2")
                const lines = tc.steps.split('\n');
                stepsArray = [];
                let currentStep: any = null;
                
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;
                    
                    // Check if line starts with a number (step number)
                    const stepMatch = trimmed.match(/^(\d+)\.\s*(.+)$/);
                    if (stepMatch) {
                        // Save previous step if exists
                        if (currentStep) {
                            stepsArray.push(currentStep);
                        }
                        // Start new step
                        currentStep = {
                            step_number: parseInt(stepMatch[1]),
                            action: stepMatch[2],
                            expected_result: '',
                            test_data: ''
                        };
                    } else if (trimmed.toLowerCase().startsWith('expected')) {
                        // Expected result line
                        const expectedMatch = trimmed.match(/expected[:\s]+(.+)$/i);
                        if (expectedMatch && currentStep) {
                            currentStep.expected_result = expectedMatch[1].trim();
                        }
                    } else if (currentStep) {
                        // Continuation of action
                        currentStep.action += ' ' + trimmed;
                    }
                }
                
                // Add last step
                if (currentStep) {
                    stepsArray.push(currentStep);
                }
            }
            
            return {
                id: tc.id,
                title: tc.title,
                description: tc.description || '',
                preconditions: tc.preconditions || '',
                expected_result: tc.expected_result || '',
                priority: tc.priority || 'medium',
                test_type: tc.test_type || 'functional',
                tags: tc.tags || [],
                steps: stepsArray.map((step: any, idx: number) => ({
                    step_number: step.step_number || idx + 1,
                    action: step.action || '',
                    expected_result: step.expected_result || '',
                    test_data: step.test_data || ''
                }))
            };
        });
        
        const response = await fetch(`${API_BASE_URL}/api/v1/test-plans/${issueKey}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                test_cases: testCasesPayload,
                upload_to_zephyr: uploadToZephyr,
                project_key: projectKey
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update test plan: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Test plan updated successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to update test plan:', error);
        throw error;
    }
};
