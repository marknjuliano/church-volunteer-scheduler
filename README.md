# Church Volunteer Scheduler v1.0.0 Alpha 3

A professional, Firebase-powered church volunteer scheduling app.

## Included

- Email/password authentication
- Role-based access: Admin, Coordinator, Volunteer, Schedule Viewer
- Pending-account approval flow
- Ministry management with show/hide, archive, and delete
- Custom ministry roles such as ProPresenter, FOH, Lights, FB Sound, and Camera Switcher
- Service creation, editing, duplication, archiving, and deletion
- Volunteer assignments by ministry and role
- Monthly calendar and next-service views
- Responsive professional interface for desktop and mobile

## Deployment

The app is ready for GitHub Pages. Publish the `main` branch from the repository root.

## Firebase

Firebase configuration is stored in `js/firebase.js`. Firestore rules are in `firestore.rules`.


## Alpha 3.1 fix
- Fixed Add Role feedback and error handling.
- If adding a role is blocked, the app now shows whether Firestore rules need to be published.
- Ensure the included `firestore.rules` is published in Firebase Console.
