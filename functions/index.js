// functions/index.js

const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');

admin.initializeApp();
const db = admin.firestore();

/**
 * Fisher–Yates shuffle to randomize an array in place.
 */
function shuffle(array) {
  let m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

/**
 * Scheduled Cloud Function: runs every day at midnight Eastern Time,
 * picks 4 random quests and 4 random shop items, and writes them to Firestore.
 */
exports.generateDailyGlobals = onSchedule(
  {
    schedule: '0 4 * * *',            // 04:00 UTC = 00:00 America/New_York
    timeZone: 'America/New_York',
  },
  async (event) => {
    // Compute today’s date in NY (YYYY-MM-DD)
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/New_York'
    });

    // ── Pick 4 random quests ─────────────────────────────────────────────
    const questSnap = await db.collection('quests').get();
    const allQuestIds = questSnap.docs.map(d => d.id);
    if (allQuestIds.length >= 4) {
      const pickedQuests = shuffle(allQuestIds).slice(0, 4);
      await db.doc('daily/globalQuests').set({
        date: today,
        questIds: pickedQuests,
      });
    }

    // ── Pick 4 random shop items ────────────────────────────────────────
    const itemSnap = await db.collection('shopItems').get();
    const allItemIds = itemSnap.docs.map(d => d.id);
    if (allItemIds.length >= 4) {
      const pickedItems = shuffle(allItemIds).slice(0, 4);
      await db.doc('daily/globalShopItems').set({
        date: today,
        itemIds: pickedItems,
      });
    }

    console.log(`✅ Daily globals generated for ${today}`);
  }
);
