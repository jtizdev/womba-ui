import { TestCase } from '../types';

const mockTestCases: TestCase[] = [
  {
    id: 'TC-001',
    title: 'User Login with Valid Credentials',
    steps: `1. Navigate to the login page.
2. Enter a valid username and password.
3. Click the "Login" button.
4. Verify the user is redirected to the dashboard.`,
    isSelected: true,
    isExpanded: true,
  },
  {
    id: 'TC-002',
    title: 'User Login with Invalid Password',
    steps: `1. Navigate to the login page.
2. Enter a valid username and an invalid password.
3. Click the "Login" button.
4. Verify an error message "Invalid credentials" is displayed.`,
    isSelected: false,
    isExpanded: true,
  },
  {
    id: 'TC-003',
    title: 'Create a New Project from Dashboard',
    steps: `1. Ensure the user is logged in and on the dashboard.
2. Click the "New Project" button.
3. Fill in project details (e.g., name: "My Awesome Project").
4. Click "Create".
5. Verify the user is redirected to the new project board.`,
    isSelected: true,
    isExpanded: true,
  },
    {
    id: 'TC-004',
    title: 'Update User Profile Information',
    steps: `1. Navigate to the user profile page.
2. Click the "Edit Profile" button.
3. Change the "Display Name" to a new value.
4. Click "Save Changes".
5. Verify the new display name is shown on the profile.`,
    isSelected: false,
    isExpanded: true,
  },
];

export const fetchTestCases = (): Promise<TestCase[]> => {
  console.log('Fetching test cases...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Test cases fetched.');
      resolve(JSON.parse(JSON.stringify(mockTestCases))); // Deep copy
    }, 1500);
  });
};

export const uploadTestCases = (cases: TestCase[]): Promise<{ success: boolean }> => {
  console.log('Uploading test cases:', cases);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Upload successful.');
      resolve({ success: true });
    }, 2000);
  });
};
