/**
 * Security Rules Dirty Dozen Verification Suite
 */
export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list';
  payload: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on UserProfile',
    collection: 'users/user_123',
    operation: 'create',
    payload: {
      uid: 'user_123',
      displayName: 'Student',
      currentModuleId: 'module-0',
      currentLevel: 1,
      streakDays: 1,
      totalStudyMinutes: 120,
      isAdmin: true
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    collection: 'users/user_123',
    operation: 'create',
    payload: { email_verified: false },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Cross-User Profile Hijack',
    collection: 'users/user_999',
    operation: 'create',
    payload: { uid: 'user_123' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Owner Spoofing on TopicProgress',
    collection: 'topicProgress/tp_1',
    operation: 'create',
    payload: { ownerId: 'victim_uid', moduleId: 'module-0', status: 'mastered' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'Orphaned TopicProgress Write without parent user',
    collection: 'topicProgress/tp_1',
    operation: 'create',
    payload: { ownerId: 'non_existent_user' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'ID Poisoning Attack',
    collection: 'topicProgress/invalid$id!@#',
    operation: 'create',
    payload: { ownerId: 'user_123' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Denial of Wallet String Overflow on TutorSession',
    collection: 'tutorSessions/sess_1',
    operation: 'update',
    payload: { messagesJson: 'x'.repeat(60000) },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Immutable Field Mutation on TopicProgress',
    collection: 'topicProgress/tp_1',
    operation: 'update',
    payload: { ownerId: 'new_owner_uid' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Client Timestamp Forgery',
    collection: 'users/user_123',
    operation: 'create',
    payload: { createdAt: '1999-01-01T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Enum Bypass on TopicProgress status',
    collection: 'topicProgress/tp_1',
    operation: 'create',
    payload: { status: 'super_mastered' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Out-of-Bounds Socratic Level',
    collection: 'topicProgress/tp_1',
    operation: 'update',
    payload: { socraticLevel: 99 },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Blanket List Scraping without ownerId filter',
    collection: 'topicProgress',
    operation: 'list',
    payload: {},
    expectedOutcome: 'PERMISSION_DENIED'
  }
];
