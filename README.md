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


## Alpha 4.8

- Replaced the long People card list with a compact directory table.
- Added account summary cards, search, role filter, status filter, and pagination.
- Added quick actions to edit a display name or jump to user qualifications.
- People remains under Admin and collapsed by default.


## Alpha 4.9

- Fixed invisible calendar dates caused by the global white button text color.
- Fixed the selected-day class styling.
- Improved the selected-date service panel.
- Added an inline favicon to remove the harmless browser 404 warning.


## Alpha 5.0

- Rebuilt the Home page as a compact professional dashboard.
- Removed the oversized decorative service hero and separate My Assignment sidebar.
- Services on the nearest upcoming date remain expanded.
- My Assignment now shows Ministry and Role in a collapsible section.
- Team lists are collapsible.
- Future service dates appear in a compact expandable sidebar.
- Added responsive desktop and mobile layouts.


## Alpha 5.1

- Replaced the single Team list on Home with ministry-grouped sections.
- Each ministry shows its assigned volunteer count.
- Ministry sections are collapsible.
- Volunteers inside each ministry are sorted by role, then by name.


## Alpha 5.2

- Added an Admin-only **Generate 20 Demo People** button under Pending Accounts.
- All generated demo people start with `role: pending` and `status: pending`.
- Demo people have no ministry or role qualifications by default.
- Demo records are Firestore-only test people and do not have Firebase Authentication login credentials.
- Demo records are marked with `demo: true` for easy identification later.


## Alpha 5.3

- Fixed ministry-role checkbox layout shifting when checked or unchecked.
- Checkbox and pill dimensions now stay constant in both states.
- Open Admin sections remain open after Firestore updates.
- Open user qualification panels remain open after saving roles.
- Panels stay open until the user manually collapses them.


## Alpha 5.4

- Expanded service panels under Schedule remain open after adding a volunteer.
- Expanded service panels remain open after removing an assignment.
- Firestore snapshot refreshes no longer collapse the service being edited.
- A panel closes only when the user manually collapses it.


## Alpha 5.5

- Added Calendar View and List View tabs to the user Schedule page.
- List View is organized by Date → Service → Ministry → Role / Volunteer.
- Only the nearest upcoming service date is expanded by default.
- Future dates are collapsed until the user opens them.
- Expanded/collapsed date state survives live Firestore updates.
- Added a printer-friendly Print Schedule button.
- Print output includes only dates currently expanded in List View and supports Save as PDF.


## Alpha 5.6

- Admin Schedule service panels remain expanded while repeatedly adding volunteers.
- Pressing Enter from the assignment controls adds the volunteer to that same service.
- Firestore live updates no longer collapse the service currently being edited.
- Expanded Schedule service panels are remembered for the browser session.
- After an assignment is added, focus returns to the same service's volunteer selector.
- Removing an assignment also keeps the service panel expanded.


## Alpha 5.7

- Fixed the missing Calendar View / List View switcher.
- Added stronger mobile styling so both view buttons remain visible.
- Preserved Alpha 5.6 Admin scheduling workflow improvements.
- List View is grouped by Date → Service → Ministry → Role / Volunteer.
- The next service date opens by default; later dates remain collapsed.
- Added printable schedule output and Save as PDF support.
- Updated asset cache-busting to Alpha 5.7.


## Alpha 5.8

- Added a ministry-based Grid View under the coordinator/admin Schedule page.
- Select a ministry and month, then choose which role columns to display.
- Each role header is a dropdown, so columns can be changed manually.
- Each schedule cell contains a qualified-volunteer dropdown.
- Assignments save automatically; selecting Unassigned removes the assignment.
- Regular volunteer overlap rules and Volunteer (S) behavior are preserved.
- Date and Service columns remain frozen while role columns scroll horizontally.
- Role headers remain sticky while scrolling vertically.
- Added print / Save as PDF support for the grid.
