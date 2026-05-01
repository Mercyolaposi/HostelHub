# Phase 0: Payload-First Security TDD

## Data Invariants
1. A single Global default-deny rule prevents unauthorized access by default.
2. Admins have access to all collections and can bypass restrictions. Admin status is strictly defined by an `exists(/databases/$(database)/documents/users/$(request.auth.uid))` check combined with `data.role == "admin"`.
3. Users collection handles authentication limits. Users cannot set themselves as admin.
4. Hostels must belong to a verified manager (`get()` check, manager role). Only managers can create/update hostels they own.
5. Rooms must belong to an existing Hostel. Only the hostel's manager or admin can create/update rooms.
6. Reviews must belong to an existing Hostel. Only signed-in students/guests can review.
7. Bookings update related rooms to reduce available beds. This needs to be checked carefully. Only students can create bookings.
8. Complaints can be created by students. Managers can respond to complaints on their hostels.
9. Inquiries can be created by students/guests. Managers can only read/update their inquiries.
10. ManagerVerifications can be created by anyone requesting to be a manager. Admins can update.
11. Payouts are created by admins. Managers can read.

## The "Dirty Dozen" Payloads
1. **The Shadow Update:** A user tries to update a `User` profile with a payload inserting `role: 'admin'`.
2. **The ID Spoofer:** A student attempts to create a `Booking` where `studentId` does not match `request.auth.uid`.
3. **The Size Exhaustion:** A malicious user creates an `Inquiry` with a 1MB `message` string.
4. **The Ghost Parent:** Creating a `Room` under a `hostelId` that doesn't exist.
5. **The Unverified Subvert:** A user without an `email_verified` (or verified phone if enabled, though we might just enforce `auth != null`) token tries to write.
6. **The Immutable Breaker:** A manager attempts to `update` a `Booking` and tries to shift the `amount` instead of just status. 
7. **The Terminal Resurrector:** A manager updates a `Complaint` that resolves it, and then tries to modify it again after it reached 'resolved' state.
8. **The PII Sweeper:** An authenticated basic user attempts to `get` the `users` list to scrape emails and phone numbers.
9. **The Spoofed Author:** An admin? No, a manager trying to post a `Review` representing a student.
10. **The Array Bomb:** A manager tries to update `Hostel`/`amenities` with 10,000 array elements.
11. **The Time Machine:** Modifying `createdAt` field during an update.
12. **The Orphaned Child:** Trying to read another manager's `Payout` document.

## Test Runner Definition
We will generate `firestore.rules.test.ts` to assert that these rules fail against malicious payloads and succeed for legitimate ones.
