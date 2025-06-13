// src/utils/globalDailyUtils.js

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';  // ← use your named export

/**
 * Read the “daily” document (either globalQuests or globalShopItems)
 * and return its stored array of IDs.
 */
async function fetchGlobalIds(docName) {
  const snap = await getDoc(doc(db, 'daily', docName));
  if (!snap.exists()) {
    throw new Error(`Global daily document "${docName}" not found. Has your Cloud Function run?`);
  }
  const data = snap.data();
  return data.questIds ?? data.itemIds ?? [];
}

/**
 * Returns an array of 4 quest objects shaped for your Quests.js:
 * { id, name, xp, coins, description, requirement, rarity, tags, imageUrl }
 */
export async function getGlobalDailyQuests() {
  const ids = await fetchGlobalIds('globalQuests');
  const snaps = await Promise.all(
    ids.map((id) => getDoc(doc(db, 'quests', id)))
  );

  return snaps
    .filter((s) => s.exists())
    .map((s) => {
      const d = s.data();
      return {
        id: s.id,
        name: d.name,
        xp: d.xpReward,
        coins: d.coinsReward,
        description: d.description,
        requirement: d.requirement,
        rarity: d.rarity,
        tags: d.tags,
        imageUrl: d.imageUrl,
      };
    });
}

/**
 * Returns an array of 4 item objects shaped for your Shop.js:
 * { id, name, price, description, rarity, icon, type, effect, stat, bonus }
 */
export async function getGlobalDailyShopItems() {
  const ids = await fetchGlobalIds('globalShopItems');
  const snaps = await Promise.all(
    ids.map((id) => getDoc(doc(db, 'shopItems', id)))
  );

  return snaps
    .filter((s) => s.exists())
    .map((s) => {
      const d = s.data();
      let effect = '';
      let stat = '';
      let bonus = 0;
      const entries = d.statBonuses ? Object.entries(d.statBonuses) : [];
      if (entries.length) {
        [stat, bonus] = entries[0];
        effect = `+${bonus} ${stat}`;
      }

      return {
        id: s.id,
        name: d.name,
        price: d.cost,
        description: d.description,
        rarity: d.rarity,
        icon: d.iconUrl,
        type: d.type,
        effect,
        stat,
        bonus,
      };
    });
}
