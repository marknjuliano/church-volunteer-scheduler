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
