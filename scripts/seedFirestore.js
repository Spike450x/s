// scripts/seedFirestore.js

const admin = require('firebase-admin');
const quests = require('./quests.json');
const shopItems = require('./shopItems.json');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function seed() {
  // Seed quests
  const qCol = db.collection('quests');
  for (const [id, data] of Object.entries(quests)) {
    console.log(`Writing quest ${id}`);
    await qCol.doc(id).set(data);
  }

  // Seed shopItems
  const sCol = db.collection('shopItems');
  for (const [id, data] of Object.entries(shopItems)) {
    console.log(`Writing shopItem ${id}`);
    await sCol.doc(id).set(data);
  }

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
