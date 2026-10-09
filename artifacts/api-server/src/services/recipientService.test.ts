import { getRecipients, EntityStakeholders, NotificationEvent } from './recipientService.js';

function assertEqual(actual: any, expected: any, testName: string) {
  const actualStr = JSON.stringify(Array.isArray(actual) ? actual.sort() : actual);
  const expectedStr = JSON.stringify(Array.isArray(expected) ? expected.sort() : expected);

  if (actualStr === expectedStr) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}\n  Expected: ${expectedStr}\n  Received: ${actualStr}`);
    process.exitCode = 1;
  }
}

console.log('\n--- Running getRecipients Unit Tests ---\n');

const ASSIGNEE_1 = 'user-assignee-1';
const ASSIGNEE_2 = 'user-assignee-2';
const ASSIGNEE_3 = 'user-assignee-3';
const REVIEW_LEAD = 'user-review-lead';
const THIRD_PARTY_MANAGER = 'user-third-party-mgr';
const ADMIN_USER = 'user-system-admin';
const TAGGED_USER = 'user-tagged-1';

// Case 1: Actor is an assignee -> notify reviewing lead only
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-101',
    assigneeUserIds: [ASSIGNEE_1],
    reviewingLeadUserId: REVIEW_LEAD,
  };
  const result = getRecipients(stakeholders, ASSIGNEE_1, 'STATUS_CHANGED');
  assertEqual(result.recipientUserIds, [REVIEW_LEAD], 'Case 1: Actor is assignee -> notify lead only');
}

// Case 2: Actor is the reviewing lead -> notify all assignees only
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-102',
    assigneeUserIds: [ASSIGNEE_1, ASSIGNEE_2],
    reviewingLeadUserId: REVIEW_LEAD,
  };
  const result = getRecipients(stakeholders, REVIEW_LEAD, 'COMMENT_ADDED');
  assertEqual(result.recipientUserIds, [ASSIGNEE_1, ASSIGNEE_2], 'Case 2: Actor is lead -> notify all assignees only');
}

// Case 3: Actor is a third party (manager or admin) -> notify both assignees and lead
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-103',
    assigneeUserIds: [ASSIGNEE_1],
    reviewingLeadUserId: REVIEW_LEAD,
  };
  const result = getRecipients(stakeholders, THIRD_PARTY_MANAGER, 'SUBTASK_ADDED');
  assertEqual(result.recipientUserIds, [ASSIGNEE_1, REVIEW_LEAD], 'Case 3: Actor is 3rd party -> notify both assignee and lead');
}

// Case 4: Multiple assignees, one assignee acts -> notify lead only (co-assignees not spammed on micro-updates)
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-104',
    assigneeUserIds: [ASSIGNEE_1, ASSIGNEE_2, ASSIGNEE_3],
    reviewingLeadUserId: REVIEW_LEAD,
  };
  const result = getRecipients(stakeholders, ASSIGNEE_1, 'SUBTASK_COMPLETED');
  assertEqual(result.recipientUserIds, [REVIEW_LEAD], 'Case 4: One assignee acts among multiple -> notify lead only');
}

// Case 5: Assignee and lead are the exact same person -> notify nobody (solo task)
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-105',
    assigneeUserIds: [ASSIGNEE_1],
    reviewingLeadUserId: ASSIGNEE_1, // same person
  };
  const result = getRecipients(stakeholders, ASSIGNEE_1, 'STATUS_CHANGED');
  assertEqual(result.recipientUserIds, [], 'Case 5: Assignee and lead are same person -> notify nobody');
}

// Case 6: Reassignment -> notify new assignee, and send old assignee "removed" notice
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-106',
    assigneeUserIds: [ASSIGNEE_2], // new assignee
    previousAssigneeUserIds: [ASSIGNEE_1], // old assignee
    reviewingLeadUserId: REVIEW_LEAD,
  };
  const result = getRecipients(stakeholders, REVIEW_LEAD, 'REASSIGNED');
  assertEqual(result.recipientUserIds, [ASSIGNEE_2], 'Case 6a: Reassignment primary recipient is new assignee');
  assertEqual(result.removedAssigneeUserIds, [ASSIGNEE_1], 'Case 6b: Reassignment removal notice to old assignee');
}

// Case 7: Admin is third-party -> Admin performs action, receives ZERO notifications (no self-alert)
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-107',
    assigneeUserIds: [ASSIGNEE_1],
    reviewingLeadUserId: REVIEW_LEAD,
  };
  const result = getRecipients(stakeholders, ADMIN_USER, 'SIGNED_OFF');
  assertEqual(result.recipientUserIds.includes(ADMIN_USER), false, 'Case 7: Admin actor excluded from recipients');
  assertEqual(result.recipientUserIds, [ASSIGNEE_1, REVIEW_LEAD], 'Case 7b: Third-party admin alert routes to assignee and lead only');
}

// Case 8: Missing lead -> Actor is assignee, reviewing lead is null -> Returns [] (NO fallback to admin!)
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-108',
    assigneeUserIds: [ASSIGNEE_1],
    reviewingLeadUserId: null,
  };
  const result = getRecipients(stakeholders, ASSIGNEE_1, 'STATUS_CHANGED');
  assertEqual(result.recipientUserIds, [], 'Case 8: Missing lead with assignee actor -> drops alert, NO admin fallback');
}

// Case 9: Explicit MENTIONED event
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-109',
    assigneeUserIds: [ASSIGNEE_1],
    reviewingLeadUserId: REVIEW_LEAD,
    taggedUserIds: [TAGGED_USER, ASSIGNEE_1],
  };
  const result = getRecipients(stakeholders, ASSIGNEE_1, 'MENTIONED');
  assertEqual(result.recipientUserIds, [TAGGED_USER], 'Case 9: MENTIONED event notifies tagged user and excludes actor');
}

// Case 10: Lifecycle event coverage (CREATED, DUE_DATE_CHANGED, REOPENED)
{
  const events: NotificationEvent[] = ['CREATED', 'DUE_DATE_CHANGED', 'REOPENED'];
  for (const ev of events) {
    const stakeholders: EntityStakeholders = {
      entityType: 'SPRINT',
      entityId: 'sprint-1',
      assigneeUserIds: [ASSIGNEE_1],
      reviewingLeadUserId: REVIEW_LEAD,
    };
    const result = getRecipients(stakeholders, REVIEW_LEAD, ev);
    assertEqual(result.recipientUserIds, [ASSIGNEE_1], `Case 10: Event ${ev} from lead routes strictly to assignee`);
  }
}

// Case 11: Initiative created by Manager -> routes to owner AND Admin, excludes actor
{
  const stakeholders: EntityStakeholders = {
    entityType: 'INITIATIVE',
    entityId: 'init-1',
    assigneeUserIds: [ASSIGNEE_1],
    reviewingLeadUserId: null,
    adminUserIds: [ADMIN_USER],
  };
  const result = getRecipients(stakeholders, REVIEW_LEAD, 'CREATED');
  assertEqual(result.recipientUserIds, [ASSIGNEE_1, ADMIN_USER], 'Case 11: Initiative CREATED routes to owner and all admins');
}

// Case 12: Epic updated by Manager -> routes to owner AND Admin
{
  const stakeholders: EntityStakeholders = {
    entityType: 'EPIC',
    entityId: 'epic-1',
    assigneeUserIds: [ASSIGNEE_1],
    reviewingLeadUserId: null,
    adminUserIds: [ADMIN_USER],
  };
  const result = getRecipients(stakeholders, REVIEW_LEAD, 'STATUS_CHANGED');
  assertEqual(result.recipientUserIds, [ASSIGNEE_1, ADMIN_USER], 'Case 12: Epic STATUS_CHANGED routes to owner and all admins');
}

// Case 13: Project created by Admin -> routes to team members, Admin actor excluded
{
  const stakeholders: EntityStakeholders = {
    entityType: 'PROJECT',
    entityId: 'proj-1',
    assigneeUserIds: [ASSIGNEE_1, ASSIGNEE_2],
    reviewingLeadUserId: null,
    adminUserIds: [ADMIN_USER],
  };
  const result = getRecipients(stakeholders, ADMIN_USER, 'CREATED');
  assertEqual(result.recipientUserIds, [ASSIGNEE_1, ASSIGNEE_2], 'Case 13: Project CREATED by Admin notifies team members, Admin actor excluded');
}

// Case 14: Task STATUS_CHANGED -> Admin NOT assigned receives ZERO alerts (invariant holds)
{
  const stakeholders: EntityStakeholders = {
    entityType: 'TASK',
    entityId: 'task-114',
    assigneeUserIds: [ASSIGNEE_1],
    reviewingLeadUserId: REVIEW_LEAD,
    adminUserIds: [ADMIN_USER],
  };
  const result = getRecipients(stakeholders, REVIEW_LEAD, 'STATUS_CHANGED');
  assertEqual(result.recipientUserIds, [ASSIGNEE_1], 'Case 14: Task STATUS_CHANGED routes strictly to assignee, Admin NOT notified');
}

if (process.exitCode === 1) {
  console.error('\n❌ SOME UNIT TESTS FAILED!\n');
} else {
  console.log('\n🎉 ALL UNIT TESTS PASSED WITH 100% ACCURACY!\n');
}
