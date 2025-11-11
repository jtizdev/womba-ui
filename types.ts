export interface TestCase {
  id: string;
  title: string;
  description?: string;
  preconditions?: string;
  expected_result?: string;
  steps: string;  // Kept as string for UI compatibility
  stepsArray?: TestStep[];  // Optional structured steps
  priority?: string;
  test_type?: string;
  tags?: string[];
  isSelected: boolean;
  isExpanded: boolean;
}

export interface JiraStory {
  id: string;
  title: string;
  description: string;
  updated?: string;
}

export interface RagCollectionInfo {
    name: string;
    count: number;
    exists: boolean;
}

export interface RagStats {
    test_plans?: RagCollectionInfo;
    confluence_docs?: RagCollectionInfo;
    jira_stories?: RagCollectionInfo;
    existing_tests?: RagCollectionInfo;
    external_docs?: RagCollectionInfo;
    swagger_docs?: RagCollectionInfo;
    total_documents?: number;
    storage_path?: string;
    [key: string]: any; // Allow for additional collections
}

export interface TestStep {
  step_number: number;
  action: string;
  expected_result: string;
}

export interface TestCaseAPI {
  title: string;
  description?: string;
  preconditions?: string;
  expected_result?: string;
  steps: TestStep[];
  priority?: string;
  test_type?: string;
  tags?: string[];
  automation_candidate?: boolean;
}

export interface TestPlan {
  story: any;
  test_cases: TestCaseAPI[];
  metadata?: {
    total_test_cases: number;
    edge_case_count?: number;
    integration_test_count?: number;
  };
  summary?: string;
}

export interface ZephyrResults {
  test_case_ids?: string[];
  uploaded_count?: number;
  [key: string]: any;
}

export interface GenerateTestPlanResponse {
  test_plan: TestPlan;
  zephyr_results?: ZephyrResults;
}

export interface Config {
  atlassian_url?: string;
  atlassian_email?: string;
  project_key?: string;
  ai_model: string;
  repo_path?: string;
  git_provider: string;
  default_branch: string;
  auto_upload: boolean;
  auto_create_pr: boolean;
  ai_tool: string;
}

export interface Stats {
  total_tests: number;
  total_stories: number;
  time_saved: number;
  success_rate: number;
  tests_this_week: number;
  stories_this_week: number;
}

export interface HistoryItem {
  id: string;
  story_key: string;
  created_at: string;
  test_count: number;
  status: string;
  duration?: number;
  zephyr_ids?: string[];
  test_plan?: TestPlan;
  metadata?: any;
}

export interface RagSearchResult {
  document: string;
  metadata: any;
  score: number;
}
