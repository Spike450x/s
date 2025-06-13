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
  console.log('Seeding quests...');
  for (const [id, data] of Object.entries(quests)) {
    await db.collection('quests').doc(id).set(data);
    console.log(`  → Wrote quest ${id}`);
  }

  // Seed shop items
  console.log('Seeding shopItems...');
  for (const [id, data] of Object.entries(shopItems)) {
    await db.collection('shopItems').doc(id).set(data);
    console.log(`  → Wrote shopItem ${id}`);
  }

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
