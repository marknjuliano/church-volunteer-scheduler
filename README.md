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


## Alpha 5.9

- Fixed the Grid View layout bug that stacked all role headers vertically.
- Each role now appears as its own horizontal column.
- Role columns can be added, changed, or removed.
- Added Add Date / Service Row.
- Existing service rows can be edited or removed directly from the grid.
- Removing a service row also removes its assignments after confirmation.
- Date and Service remain frozen on the left.
- Row Actions remain frozen on the right.
- Sticky role headers remain visible while scrolling vertically.


## Alpha 6.0

- Made the Add Column control more visible and easier to find.
- Added a compact toolbar above the grid with Add Row and Add Column actions.
- Replaced large Edit/Delete buttons with a professional three-dot row action menu.
- Reduced cell padding, font size, and column width to make the grid less crowded.
- Narrowed the frozen Actions column.
- Kept Date and Service frozen while role columns scroll horizontally.


## Alpha 6.1.1

- Hotfix for the blank page introduced in Alpha 6.1.
- Restored the complete Grid View markup from Alpha 6.0.
- Added safe drag-and-drop reordering for visible role columns.
- Assigned volunteer cells move automatically with their role column.
- Added left/right controls for mobile and touch devices.
- Role-column order remains saved per ministry.


## Alpha 6.1.2

- Volunteer dropdowns are sorted alphabetically by display name.
- Sorting is case-insensitive and uses natural numeric ordering.
- Email is used as a tie-breaker when display names match.
- Applies to Grid View qualified-volunteer dropdowns and broad Schedule volunteer selectors.
- Preserves the Alpha 6.1.1 draggable role-column hotfix.


## Alpha 6.1.3

- Fixed Grid View volunteer dropdowns that were still appearing out of order.
- Added stricter case-insensitive and punctuation-insensitive sorting.
- Sorting is now applied directly at the Grid View dropdown render point.
- Email remains the tie-breaker when display names match.
- Updated cache version to force browsers to load the corrected JavaScript.


## Alpha 6.1.4

- Grid printing now defaults to Letter landscape.
- Added a professional print-only title block with church name, month, ministry, and roster subtitle.
- Expanded the schedule to use the full printable page width.
- Improved role header, date, service, and assignment column sizing.
- Replaced printed unassigned dropdown text with a cleaner OPEN label.
- Added stronger date grouping, subtle row shading, and cleaner table borders.
- Hid all screen-only controls from print output.
- Preserved draggable columns, alphabetical volunteer dropdowns, and existing scheduling logic.


## Alpha 6.1.5

- Balanced the print typography so volunteer names no longer look overly bold.
- Reduced visual competition between titles, headers, dates, services, and assignments.
- Volunteer names now print at regular weight.
- OPEN now prints in a softer neutral style.
- Improved title and table alignment.
- Softened table borders and header shading for a cleaner professional look.


## Alpha 6.1.6

- Preserves the Grid View horizontal scroll position after changing a volunteer.
- Firestore live updates no longer jump the grid back to the left.
- The current right-side role remains visible while repeatedly updating assignments.
- Scroll position is remembered for the browser session.
- Also preserves position while adding, removing, changing, or reordering role columns.


## Alpha 6.1.7
- Added subtle alternating shading by date group in the live scheduling grid.
- Both services under the same date share one background tone.
- Uses only white and very light green, keeping the interface professional and uncluttered.
- Added a slightly stronger divider between dates.
- The same grouping is applied to Print / Save as PDF.
- Preserves horizontal scroll position behavior from Alpha 6.1.6.


## Alpha 6.1.8
- Added a dedicated responsive mobile scheduling view.
- Desktop/tablet keeps the spreadsheet-style scheduling grid.
- Phones show schedules grouped by date, then service, with one easy-to-tap volunteer dropdown per role.
- Removes squeezed role columns and horizontal scheduling friction on small screens.
- Keeps automatic saving, alphabetical volunteer dropdowns, service actions, date-group shading, desktop scroll preservation, and the professional landscape print/PDF table.


## Alpha 6.1.9
- Fixed Grid View failing to load after the responsive mobile scheduler update.
- Removed an undefined display-name helper reference in the mobile dropdown renderer.
- Restored both desktop Grid View and mobile scheduling cards.
- Preserves all Alpha 6.1.8 responsive behavior and prior scheduling features.


## Alpha 6.2.0 — Username or Email Login

### What changed
- New users can create an account using a unique username and password.
- A recovery email is optional.
- Existing Firebase email/password accounts continue working without migration.
- The login field accepts either a username or an email address.
- Existing email users can claim a username from Profile.
- Accounts created without a recovery email require an administrator if the password is forgotten.
- User IDs, roles, qualifications, services, and assignments remain unchanged.

### Required Firebase walkthrough
1. Upload the Alpha 6.2.0 website files to GitHub.
2. In Firebase Console, open **Firestore Database → Rules**.
3. Replace the rules with the included `firestore.rules`.
4. Click **Publish**.
5. Confirm **Authentication → Sign-in method → Email/Password** is enabled.
6. Test first with a new username account.
7. Test an existing account by logging in with its original email.

### How it works
Firebase Authentication still uses its secure email/password provider internally. Username accounts without a recovery email receive a private internal login identifier. The public app only shows and accepts the chosen username. A protected `usernames/{username}` Firestore document maps the username to its Firebase login identifier. Exact username lookups are allowed for login, but listing the username directory is blocked by Firestore rules.


## Alpha 6.2.1 — Authentication UI Polish
- Fixed helper text overlapping the next field.
- Added consistent field containers and spacing.
- Shortened recovery-email guidance.
- Simplified placeholders.
- Improved password Show/Hide button sizing and accessibility.
- Refined mobile spacing while preserving username/email authentication behavior.


## Alpha 6.2.2 (Preparation)
This package is prepared for integrating the TECH/CREATIVE SCHEDULE header.
Next step:
- Replace header image in /images with the approved asset.
- Make logo link to Dashboard/Home.
