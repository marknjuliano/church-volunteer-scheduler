# Church Volunteer Scheduler v1.0.0 Alpha 4

Firebase-powered church volunteer scheduling app.

## Alpha 4

- Assign ministry and role qualifications to each volunteer.
- Example: Mark Juliano → Tech / Creative → FOH.
- A volunteer can serve in multiple ministries and multiple roles.
- Service assignment dropdowns show only volunteers qualified for the selected ministry and role.
- Existing login, profile, calendar, ministry roles, services, duplication, and admin tools are preserved.

## Deployment

Upload the contents of this folder to the repository root. Publish GitHub Pages from the `main` branch and `/(root)`.

## Firebase

- Firebase config: `js/firebase.js`
- Firestore rules: `firestore.rules`


## Alpha 4.1
- Clarifies why the qualified-volunteer list can be empty.
- Allows schedule overlaps of up to 16 minutes with confirmation.
- Blocks overlaps longer than 16 minutes.
- Prevents assigning the same volunteer twice to one service.


## Alpha 4.2
- A volunteer may be scheduled multiple times across services and roles.
- Exact duplicate assignments for the same service, ministry, and role are prevented.
- Schedule overlaps of up to 15 minutes are allowed after confirmation.
- Overlaps longer than 15 minutes are blocked.
- Assignments within the same service are also checked for time conflicts.


## Alpha 4.3

- Added **Volunteer (S)** as a special account type.
- Volunteer (S) may be assigned repeatedly throughout the same day without duplicate or overlap blocking.
- Regular volunteers still use the 15-minute overlap allowance.
- Home now expands every service or assignment on the nearest upcoming date.
- Events on later dates remain collapsible.


## Alpha 4.4

- Added a **People** page for Admin and Coordinator accounts.
- Admins and coordinators can change a volunteer display name, such as `mark.juliano` to `Mark Juliano`.
- Existing assignment records are updated with the corrected volunteer name.
- Coordinators can read the volunteer directory required for scheduling.
- Publish the included `firestore.rules` after deployment.


## Alpha 4.5

- Reworked the phone layout for a cleaner, more compact schedule view.
- Same-day expanded service cards now use a compact horizontal date header.
- Future services have clearer collapsible cards with improved tap targets.
- Navigation tabs now scroll smoothly on narrow screens.
- Reduced spacing and improved typography for small phones.


## Alpha 4.6

- The **People** page now lists every account: Pending, Schedule Viewer, Volunteer, Volunteer (S), Coordinator, and Admin.
- Admins may edit any person's display name.
- Coordinators may edit Volunteer and Volunteer (S) display names.
- Non-editable accounts remain visible to coordinators as view-only.


## Alpha 4.7

- Moved **People** into the **Admin** page.
- Removed the separate People navigation tab.
- People is collapsed by default to reduce scrolling.
- Manage Users & Qualifications is collapsed by default.
- Manage Ministries & Roles is collapsed by default.
