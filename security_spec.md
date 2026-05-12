# Firebase Security Specification

## Data Invariants
1. A user can only access their own profile and caregiver settings.
2. Adherence records must belong to the authenticated user.
3. Lab reports must be associated with the user who uploaded them.
4. Vitals records must be private to the user.
5. Challenges are publicly visible, but participants can only update their own progress.

## Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to create a lab report with `userId` of another user.
2. **Access Escalation**: Attempt to read another user's profile.
3. **Ghost Field Injection**: Attempt to update a user profile with an unauthorized field like `isAdmin: true`.
4. **State Shortcutting**: Attempt to update a lab report severity to `normal` without AI validation (if it was `critical`).
5. **Resource Poisoning**: Use a 1MB string as a `bloodGroup` value.
6. **Orphaned Record**: Create an adherence record for a non-existent user.
7. **Timestamp Spoofing**: Provide a client-side `createdAt` timestamp for a lab report.
8. **Invalid ID**: Use a URL as a document ID to inject junk data.
9. **Unverified Email**: Attempt to write data with an unverified email (if strict verification is enforced).
10. **Query Scraping**: Attempt to list all lab reports across all users.
11. **Negative Count**: Set `takenCount` to `-1` in adherence.
12. **Caregiver Leak**: Attempt to read another user's caregiver phone number.
