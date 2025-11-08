import { API_BASE_URL } from './testCaseService';

export interface PromptSection {
  id: string;
  name: string;
  description: string;
  content: string;
  editable: boolean;
}

export interface PromptSectionsResponse {
  sections: PromptSection[];
}

export async function getPromptSections(): Promise<PromptSection[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/prompts/sections`);
  if (!response.ok) {
    throw new Error(`Failed to fetch prompt sections: ${response.statusText}`);
  }
  const data: PromptSectionsResponse = await response.json();
  return data.sections;
}

export async function getCompanyOverview(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/prompts/company-overview`);
  if (!response.ok) {
    throw new Error(`Failed to fetch company overview: ${response.statusText}`);
  }
  const data = await response.json();
  return data.content;
}

export async function updateCompanyOverview(content: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/prompts/company-overview`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update company overview: ${response.statusText}`);
  }
}

export async function getFullPrompt(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/prompts/full`);
  if (!response.ok) {
    throw new Error(`Failed to fetch full prompt: ${response.statusText}`);
  }
  const data = await response.json();
  return data.content;
}

export async function updatePromptSection(sectionId: string, content: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/prompts/sections/${sectionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update section: ${response.statusText}`);
  }
}

export async function resetPrompts(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/prompts/reset`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to reset prompts: ${response.statusText}`);
  }
}

