# What We Built — 2 July 2026

**Project:** NZCC Applicant Portal

---

## The Big Picture

Today's work focused on refining the staff administration experience and putting quality control processes in place. No major new features were added — instead, existing features were made more reliable, more informative, and better organised. We also set up an automated security review and daily reporting system so the team always has a clear picture of the portal's health.

---

## What's New or Improved

### Staff can now see who made changes on an applicant's timeline
Every event on an applicant's timeline — such as a stage change, a task being assigned, or a document being approved — now shows the name of the staff member who performed the action. Previously this was anonymous. This makes it easy to trace decisions and maintain accountability across the admissions team.

### The applicant timeline now uses the full screen width
The timeline was displaying in a narrow column with a large empty area to the right. It now fills the available screen space, making it easier to read and reducing unnecessary scrolling.

### Fixed: the "Confirm" button was missing from the Stage Advance window
When a staff member tried to advance an applicant to the next stage, the confirmation window would appear but the Confirm button was cut off and not clickable. This has been permanently fixed — the button now always appears correctly.

### Fixed: some pages were showing inconsistent styling
Certain form pages were displaying with outdated borders and colours that didn't match the rest of the portal. This was caused by the browser serving a cached version of old files. The cache has been cleared and the portal now displays consistently throughout.

### The floating developer toolbar has been removed
A small floating button was appearing in the corner of every page — a development tool not intended for regular use. It has been permanently disabled.

---

## Issues Resolved

- The Stage Advance confirmation window now always shows the Confirm button — previously it was hidden and staff had to close and reopen the window.
- Form inputs on the Tasks page now display with consistent styling matching the rest of the portal.

---

## Security

A full security review was completed today. The portal has strong foundations — staff access is properly controlled, passwords are securely stored, and sensitive files are protected against common attacks. The most important item identified is that the registration and login pages currently have no limit on how many attempts can be made in quick succession. This is the top priority for the next session and does not represent an immediate emergency, but should be addressed before the portal goes to a wider audience.

---

## What's Next

- Add protection against automated login and registration attempts
- Add file access controls so students can only download their own documents
- Set up version control so all changes to the portal are tracked and can be rolled back if needed

---

## Connectwise Note

Today's session focused on polish and reliability improvements to the NZCC Applicant Portal's staff admin area: the applicant timeline now records which staff member performed each action, the timeline page was widened to better use screen space, and a persistent bug hiding the Confirm button in the Stage Advance window was permanently fixed, along with inconsistent form styling caused by stale cached files. We also completed a full security review and stood up an automated daily reporting process so the team gets a security and build summary at the end of each session going forward. The portal's security foundations are solid overall, but the registration and login pages currently have no limit on repeated attempts, which is the top-priority item to address before the portal is opened to a wider audience — not an emergency, but recommended for the next session.
