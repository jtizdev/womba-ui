export interface TestCase {
  id: string;
  title: string;
  steps: string;
  isSelected: boolean;
  isExpanded: boolean;
}

export interface JiraStory {
  id: string;
  title: string;
  description: string;
}

export interface RagCollectionStats {
    count: number;
    collections: string[];
}

export interface RagStats {
    test_plans: RagCollectionStats;
    stories: RagCollectionStats;
}
