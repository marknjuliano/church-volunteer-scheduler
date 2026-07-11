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
