/* One-time: give YOUR admin account the "admin" custom claim.
   1) npm i firebase-admin
   2) Firebase Console > Project settings > Service accounts > Generate new private key (keep it OFF git / hosting)
   3) GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node set-admin-claim.js KFHcitZRtJRpBrOZkPcj4Dq8afu2
   4) Sign out and back in to admin.html (or wait for the token to refresh), THEN deploy the new rules.
   To remove an admin: node set-admin-claim.js <uid> remove */
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const [uid, mode] = process.argv.slice(2);
if (!uid) { console.error("Usage: node set-admin-claim.js <uid> [remove]"); process.exit(1); }
admin.auth().setCustomUserClaims(uid, mode === "remove" ? { admin: null } : { admin: true })
  .then(() => { console.log(mode === "remove" ? "Admin claim removed from " : "Admin claim set for ", uid); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
