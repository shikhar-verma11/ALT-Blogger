const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function nuclearReset() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    
    // 1. Get the Display Name (e.g., "Shikhar Verma")
    const rawName = data.displayName || data.username || "user";
    
    // 2. ONLY lowercase and remove spaces. PERIOD.
    // No suffixes, no email logic, no random numbers.
    const originalCleanName = rawName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ''); 

    console.log(`Resetting ${doc.id}: From "${data.username}" -> To "${originalCleanName}"`);

    batch.update(doc.ref, {
      username: originalCleanName
    });
    count++;
  });

  await batch.commit();
  console.log(`\nDONE! Successfully reset ${count} users.`);
  console.log(`Your username in Firestore should now be exactly: "shikharverma"`);
}

nuclearReset().catch(console.error);