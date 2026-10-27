# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Identity Isolation**: Every `UserProfile` document ID `{userId}` must strictly match `request.auth.uid` and `incoming().uid == request.auth.uid`. No PII (such as email or phone) is stored in `UserProfile`.
2. **Verified Authentication**: Every write operation requires `request.auth != null && request.auth.token.email_verified == true`.
3. **Relational Ownership**: Every document in `/topicProgress/{progressId}`, `/errorRecords/{errorId}`, and `/tutorSessions/{sessionId}` must have `ownerId == request.auth.uid`, and the parent `/users/$(request.auth.uid)` profile must exist (`exists()`).
4. **Immutable Ownership & Creation Timestamps**: `uid`, `ownerId`, and `createdAt` can never be mutated during an `update`.
5. **Temporal Integrity**: `createdAt` on create and `updatedAt` on create/update must equal `request.time`.
6. **Strict Schema & Volumetric Bounds**: All strings and integers are strictly bounded by size/range, and `keys().hasAll()` + `keys().hasOnly()` block shadow fields.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection**: Creating a `UserProfile` with an extra field `"isAdmin": true` -> Rejected by `hasOnly()`.
2. **Unverified Email Write**: Writing to `/users/{userId}` when `request.auth.token.email_verified == false` -> Rejected by `isVerifiedUser()`.
3. **Cross-User Profile Hijack**: Authenticated user `uid_A` creating `/users/uid_B` -> Rejected by `userId == request.auth.uid`.
4. **Owner Spoofing on TopicProgress**: Creating `/topicProgress/p1` with `ownerId: "victim_uid"` -> Rejected by `data.ownerId == request.auth.uid`.
5. **Orphaned TopicProgress Write**: Creating `/topicProgress/p1` when `/users/$(request.auth.uid)` does not exist -> Rejected by `exists(/databases/$(database)/documents/users/$(request.auth.uid))`.
6. **ID Poisoning Attack**: Creating a document with a 500-char or special-char ID -> Rejected by `isValidId()`.
7. **Denial of Wallet String Overflow**: Updating `TutorSession.messagesJson` with a 200KB string -> Rejected by `data.messagesJson.size() <= 50000`.
8. **Immutable Field Mutation**: Updating `createdAt` or `ownerId` on `/topicProgress/p1` -> Rejected by `incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt`.
9. **Client Timestamp Forgery**: Creating a document with a past or future `createdAt` timestamp -> Rejected by `incoming().createdAt == request.time`.
10. **Enum Bypass on TopicProgress**: Setting `status: "hacked"` on `/topicProgress/p1` -> Rejected by `data.status in ['pending', 'in_progress', 'mastered']`.
11. **Out-of-Bounds Socratic Level**: Setting `socraticLevel: 99` on `/topicProgress/p1` -> Rejected by `data.socraticLevel >= 1 && data.socraticLevel <= 4`.
12. **Blanket List Scraping**: Listing `/topicProgress` without filtering by `ownerId == request.auth.uid` -> Rejected by `resource.data.ownerId == request.auth.uid`.
