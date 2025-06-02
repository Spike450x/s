# Fitness RPG

A gamified fitness-tracking web application built with React and Firebase. Users create a fantasy RPG character whose stats and progression are tied to real-world fitness activities—completing daily quests, equipping gear, battling monsters, and earning XP and loot. The app features:

- **Authentication & Onboarding**: Sign up, log in, and create a custom character (choose class, avatar, and starting stats).
- **Dashboard**: Displays the character card (level, HP, XP, stats, equipped gear) and a collapsible inventory.
- **Inventory & Equipment**: View, filter, and equip/unequip gear; items are color-coded by rarity.
- **Shop**: Purchase new gear, consumables, and spells using in-game coins.
- **Daily Quests**: Complete real-world fitness tasks (e.g., “Drink 8 cups of water,” “Run 1 mile”) to earn XP and coins.
- **Statistics Page**: Visualize XP gained over time and battle outcomes with charts; view last activity, playtime, monsters defeated, and completed quests.
- **Fitness-Driven Stats**: Core stats (Strength, Agility, Endurance, Intellect, Vitality, Luck) automatically update based on logged fitness data in Firebase.
- **XP & Leveling System**: Gain XP from quests and battles; level up when XP reaches the threshold.

---

## Table of Contents

1. [Installation](#installation)  
2. [Configuration](#configuration)  
3. [Available Scripts](#available-scripts)  
4. [Project Structure](#project-structure)  
5. [Key Components & Utilities](#key-components--utilities)  
   - [Authentication & Onboarding](#authentication--onboarding)  
   - [Dashboard & CharacterCard](#dashboard--charactercard)  
   - [Inventory & Equipment](#inventory--equipment)  
   - [Quests System](#quests-system)  
   - [Shop System](#shop-system)  
   - [Statistics & Charts](#statistics--charts)  
   - [XP & Leveling Utilities](#xp--leveling-utilities)  
   - [Fitness → Stats Sync](#fitness--stats-sync)  
   - [Styling & Icons](#styling--icons)  
6. [Folder Overview](#folder-overview)  
7. [Future Improvements](#future-improvements)  
8. [License](#license)

---

## Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/yourusername/fitness-rpg.git
   cd fitness-rpg
   ```

2. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Firebase**  
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).  
   - Enable **Authentication** (Email/Password) and **Cloud Firestore**.  
   - Download your Firebase SDK config and create a file `src/firebase.js` with the following pattern:
     ```js
     // src/firebase.js
     import { initializeApp } from "firebase/app";
     import { getAuth } from "firebase/auth";
     import { getFirestore } from "firebase/firestore";

     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
     };

     // Initialize Firebase
     const app = initializeApp(firebaseConfig);
     export const auth = getAuth(app);
     export const db = getFirestore(app);
     ```
   - Replace each placeholder with your Firebase project’s values.

4. **Run the app**  
   ```bash
   npm start
   # or
   yarn start
   ```
   The app will run in development mode at [http://localhost:3000](http://localhost:3000).

---

## Configuration

- **Routes**  
  - `/` → Sign Up (`src/components/Signup.js`)  
  - `/login` → Log In (`src/components/Login.js`)  
  - `/character-creation` → Choose class, avatar, and starting stats (`src/components/CharacterCreation.js`)  
  - `/dashboard` → Main hub with CharacterCard and Inventory (`src/components/Dashboard.js`)  
  - `/quests` → Daily Quests page (`src/components/Quests.js`)  
  - `/shop` → In-game Shop (`src/components/Shop.js`)  
  - `/stats` → Player Statistics page (`src/pages/Statistics.js`)

- **Firebase Collections**  
  - **`users`** (one document per `uid`) containing fields:  
    - `username`, `class`, `avatar`  
    - `level`, `xp`, `coins`  
    - `stats`: `{ strength, agility, endurance, intellect, vitality, luck }`  
    - `health`: `{ current, max }`  
    - `inventory`: array of item objects  
    - `equipped`: object with slots (`weapon`, `armor`, `boots`, `consumable`)  
    - `questsCompleted`: array of quest IDs  
    - `questHistory`, `xpHistory`, `battleHistory`: arrays of history entries  
    - `monstersDefeated`, `lastActivity`, `playtime`  
    - `fitness`: `{ steps, miles, workouts, strengthSessions, sleepDays, waterDays }`

---

## Available Scripts

Inside the project directory, you can run:

- **`npm start`**  
  Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

- **`npm run build`**  
  Builds the app for production to the `build` folder.

- **`npm test`**  
  Launches the test runner (if any tests are configured).

- **`npm run lint`**  
  Runs ESLint to check code quality (if configured).

---

## Project Structure

```
fitness-rpg/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CharacterCard.js
│   │   ├── CharacterCreation.js
│   │   ├── Dashboard.js
│   │   ├── Equipment.js
│   │   ├── Inventory.js
│   │   ├── Login.js
│   │   ├── Quests.js
│   │   ├── Shop.js
│   │   ├── Signup.js
│   │   └── Tooltip.js
│   ├── pages/
│   │   └── Statistics.js
│   ├── utils/
│   │   ├── classOptions.js
│   │   ├── colors.js
│   │   ├── itemIcons.js
│   │   ├── statIcons.js
│   │   ├── stats.js
│   │   ├── updateStatsFromFitness.js
│   │   └── updateXPAndLevel.js
│   ├── firebase.js
│   ├── App.js
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

- **`src/index.js`**  
  Renders `<App />` into the DOM and sets up React Router.

- **`src/App.js`**  
  Defines all client-side routes: `/`, `/login`, `/character-creation`, `/dashboard`, `/quests`, `/shop`, `/stats`.

- **`src/firebase.js`**  
  Initializes Firebase (exports `auth` and `db`).

---

## Key Components & Utilities

### Authentication & Onboarding

- **`src/components/Signup.js`**  
  - Collects email/password and calls Firebase’s `createUserWithEmailAndPassword`.
  - On success, navigates to `/character-creation`.

- **`src/components/Login.js`**  
  - Prompts for email/password and calls Firebase’s `signInWithEmailAndPassword`.
  - On success, navigates to `/dashboard`.

- **`src/components/CharacterCreation.js`**  
  - Allows the user to enter a character name and select one of six classes (Warrior, Wizard, Rogue, Cleric, Paladin, Archer).
  - Reads class data from `src/utils/classOptions.js`, which defines for each class:
    - `label`, `description`, `startingStats`, `color`, `avatar`, `startingItem`.
  - On submission, creates a Firestore document under `users/{uid}` with initial fields:
    - `username`, `class`, `avatar`, `level: 1`, `xp: 0`, `coins: 50`
    - `stats` ← `startingStats`
    - `health: { current: 100, max: 100 }`
    - `inventory`: `[ startingItem ]`
    - `equipped`: `{ weapon: startingItem }`
    - Empty arrays/histories for `questsCompleted`, `monstersDefeated`, `xpHistory`, `questHistory`, `battleHistory`.
    - `lastActivity`: current date, `playtime: 0`
    - `fitness`: zeroed fields (`steps, miles, workouts, strengthSessions, sleepDays, waterDays`).

### Dashboard & CharacterCard

- **`src/components/Dashboard.js`**  
  - On render, checks `auth.currentUser`; if none, redirects to `/login`.
  - Uses `onSnapshot` to listen to changes on `users/{uid}`.
  - If `lastActivity` is not today:
    1. Updates `lastActivity` to today and increments `playtime` by 0.25 hours.
    2. Calls `updateStatsFromFitness(uid)` to sync real-world fitness data into base `stats`.
  - Displays:
    - A centered “Welcome back, [username]” message.
    - `<CharacterCard user={userData} />`.
    - A Logout button (calls `signOut(auth)` and redirects to `/login`).
    - Top-right nav buttons for Shop (`/shop`) and Quests (`/quests`).
    - A collapsible “Show Inventory” / “Hide Inventory” section that renders `<Inventory>` with props:
      ```js
      items={userData.inventory || []}
      equipped={userData.equipped || {}}
      onEquip={handleEquip}
      onUnequip={handleUnequip}
      ```
      where `handleEquip(item)` and `handleUnequip(slotType)` update Firestore accordingly.

- **`src/components/CharacterCard.js`**  
  - Receives the full `user` object as a prop.
  - Uses `classColors[user.class]` for border/background and `xpBarColors[user.class]` for the XP bar.
  - Calculates:
    ```js
    const xpNeeded = 50 * (level ** 2);
    const xpPercentage = Math.min((xp / xpNeeded) * 100, 100);
    const hpPercentage = (currentHealth / maxHealth) * 100;
    ```
  - Retrieves `effectiveStats` by calling:
    ```js
    import { getEffectiveStats } from "../utils/stats";
    const effectiveStats = getEffectiveStats(user.stats, user.equipped);
    ```
    which adds any “+N StatName” bonuses from equipped items.
  - Renders:
    - Character name, avatar, and a “Class ▽ Level” label.
    - HP bar (red fill at `hpPercentage%`).
    - XP bar (class-colored fill at `xpPercentage%`).
    - A stats grid showing each base stat (`strength, agility, endurance, intellect, vitality, luck`) with icons from `statIcons` (imported from `../utils/statIcons.js`). Clicking an icon toggles a `<Tooltip>` containing `statTooltips[statKey]`.
    - Equipped gear slots (weapon, armor, boots, consumable):
      - Displays item name (colored by rarity via `rarityColors[item.rarity]`), rarity, and effect text.
      - Clicking toggles a `<Tooltip>` with the item’s full `description`.
      - If a slot is empty, shows `[None]`.
    - A “View Statistics” button linking to `/stats`.

### Inventory & Equipment

- **`src/components/Inventory.js`**  
  - Props:
    ```js
    items        // array of item objects from Firestore
    equipped     // object { weapon, armor, boots, consumable }
    onEquip(item)    // callback to equip that item
    onUnequip(slot)  // callback to unequip from a given slot
    ```
  - Features:
    - A dropdown to filter by rarity (Common, Uncommon, Rare, Epic, Legendary) or “All.”
    - Maps each `item` → a card showing:
      - Icon (`item.icon` from `src/utils/itemIcons.js`).
      - Name (colored via `rarityColors[item.rarity]`).
      - Effect text (e.g., “+5 Strength”).
      - Rarity & type.
      - A button that toggles between “Equip” (if not currently equipped) and “Unequip” (if its `id` matches one in `equipped`).
    - Each card’s border color is set via `rarityColors[item.rarity.toLowerCase()]`.

- **`src/components/Equipment.js`**  
  - (Optional helper) Displays a simple list of currently equipped gear:
    ```jsx
    <div>
      <h3>Equipped Gear</h3>
      <p>Weapon: {equipped.weapon?.name || "[None]"}</p>
      <p>Armor: {equipped.armor?.name || "[None]"}</p>
      <p>Boots: {equipped.boots?.name || "[None]"}</p>
      <p>Consumable: {equipped.consumable?.name || "[None]"}</p>
    </div>
    ```

### Quests System

- **`src/components/Quests.js`**  
  - Defines a static array `QUESTS`, e.g.:
    ```js
    const QUESTS = [
      { id: "drink_water", name: "Drink 8 Cups of Water", xp: 20, coins: 5 },
      { id: "run_mile",   name: "Run 1 Mile",            xp: 30, coins: 10 },
      { id: "sleep_7",    name: "Sleep 7+ Hours",         xp: 25, coins: 8 },
      { id: "pushups_30", name: "Do 30 Push-ups",         xp: 35, coins: 12 },
    ];
    ```
  - On mount:
    1. Fetches the user’s `questsCompleted` array from Firestore.
    2. Filters out which `QUESTS` are already completed based on matching `id`.
  - Renders a card for each quest showing:
    - Quest name, reward details (XP & coins).
    - “Complete Quest” button (disabled if already completed).
    - On click:
      1. Locally mark it as completed (so UI updates).
      2. Uses a Firestore transaction to:
         - Increment `xp` and `coins` on the user document (`increment` operator).
         - Append this quest’s `id` to `questsCompleted` via `arrayUnion()`.
         - Append a history entry to both `questHistory` and `xpHistory`, e.g.:
           ```js
           { id, name, date: Timestamp.now(), xpReward: xp }
           ```
      3. If the transaction fails, revert local state and show an error toast.
  - Includes a “Back to Dashboard” button (`navigate("/dashboard")`).

### Shop System

- **`src/components/Shop.js`**  
  - Uses a constant `SHOP_ITEMS` array, each item having:
    ```js
    {
      id,         // unique ID
      name,
      type,       // "Weapon" | "Armor" | "Boots" | "Consumable"
      rarity,     // "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
      effect,     // string, e.g. "+5 Strength"
      stat,       // "strength" | "agility" | etc.
      bonus,      // numeric value, e.g. 5
      price,      // in coins
      description,// detailed text
      icon,       // URL from src/utils/itemIcons.js
    }
    ```
  - On mount:
    1. Fetches the user document (to get current `coins` and `inventory`).
    2. Derives `purchasedIds` from `inventory.map(i => i.id)`.
  - Renders each shop item as a card with:
    - Icon, name, rarity (colored via `rarityColors[rarity.toLowerCase()]`), description, effect text, price (with a coin emoji).
    - “Buy” button:
      - Disabled if `purchasedIds.includes(item.id)`.
      - On click:
        1. If `userData.coins >= price`:
           - Locally subtract `price` from displayed coin balance.
           - Mark `item.id` as “purchased” in local state.
           - Firestore transaction:
             ```js
             // decrement coins
             updateDoc(userRef, { coins: increment(-price) });
             // append item object to inventory array
             updateDoc(userRef, { inventory: arrayUnion(item) });
             ```
        2. Else: Show “Not enough coins.”
        3. On transaction failure: revert local state and display an error.
  - Shows the user’s current coin balance at the top.
  - “Back to Dashboard” button at the bottom.

### Statistics & Charts

- **`src/pages/Statistics.js`**  
  - On mount:
    1. Fetch the user document.
    2. Extract:
       - `xpHistory` array (each `{ date, xp }`), sorted by date.
       - `battleHistory` array (each `{ date, outcome }`), then compute totals for wins vs. losses.
       - Other fields: `lastActivity`, `playtime`, `monstersDefeated`, `questsCompleted.length`.
  - Stores local state:
    ```js
    {
      lastActivity,
      playtime,
      monstersDefeated,
      totalQuestsCompleted,
      xpHistory,   // for the line chart
      wins,        // count of battleHistory where outcome === "win"
      losses,      // count where outcome === "loss"
    }
    ```
  - Renders:
    - Summary section (Last activity: YYYY-MM-DD, Total playtime: X hours, Monsters defeated: Y, Quests completed: Z).
    - **XP Gained Over Time**:
      ```jsx
      <Line
        data={{
          labels: xpHistory.map(e => new Date(e.date.seconds * 1000).toLocaleDateString()),
          datasets: [{ label: "XP Gained", data: xpHistory.map(e => e.xp) }]
        }}
      />
      ```
    - **Battle Outcomes**:
      ```jsx
      <Bar
        data={{
          labels: ["Wins", "Losses"],
          datasets: [{ label: "Count", data: [wins, losses] }]
        }}
      />
      ```
    - A list of completed quests (or “No quests completed yet”).
    - “Back to Dashboard” button.

### XP & Leveling Utilities

- **`src/utils/updateXPAndLevel.js`**  
  ```js
  import { doc, getDoc, updateDoc } from "firebase/firestore";
  import { db } from "../firebase";

  const getXPForNextLevel = (lvl) => Math.floor(50 * lvl * lvl);

  export const updateXPAndLevel = async (userId, gainedXP) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    let { xp, level } = userSnap.data();

    xp += gainedXP;
    let leveledUp = false;

    while (xp >= getXPForNextLevel(level)) {
      xp -= getXPForNextLevel(level);
      level += 1;
      leveledUp = true;
    }

    await updateDoc(userRef, { xp, level });
    return { xp, level, leveledUp };
  };
  ```

### Fitness → Stats Sync

- **`src/utils/updateStatsFromFitness.js`**  
  ```js
  import { doc, getDoc, updateDoc } from "firebase/firestore";
  import { db } from "../firebase";

  export const updateStatsFromFitness = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const fitness = data.fitness || {};
    const baseStats = data.stats || {};

    const updatedStats = { ...baseStats };
    updatedStats.agility   += Math.floor((fitness.miles   || 0) / 5);
    updatedStats.strength  += Math.floor((fitness.strengthSessions || 0) / 3);
    updatedStats.vitality  += Math.floor((fitness.workouts || 0) / 4);
    updatedStats.intellect += Math.floor((fitness.sleepDays || 0) / 5);
    updatedStats.endurance += Math.floor((fitness.waterDays || 0) / 5);
    updatedStats.luck      += Math.floor((fitness.steps || 0) / 10000);

    await updateDoc(userRef, { stats: updatedStats });
  };
  ```

- **`src/utils/stats.js`**  
  ```js
  export const getEffectiveStats = (baseStats, equipped) => {
    const newStats = { ...baseStats };
    Object.values(equipped || {}).forEach((item) => {
      if (!item || !item.effect) return;
      // Expect effect like "+5 Strength"
      const match = item.effect.match(/\+(\d+)\s+(\w+)/);
      if (match) {
        const [_, numStr, statName] = match;
        const num = parseInt(numStr);
        const key = statName.toLowerCase();
        if (newStats[key] !== undefined) {
          newStats[key] += num;
        }
      }
    });
    return newStats;
  };
  ```

### Styling & Icons

- **`src/utils/colors.js`**  
  ```js
  export const rarityColors = {
    common:    "#A0A0A0",
    uncommon:  "#00B300",
    rare:      "#0047AB",
    epic:      "#800080",
    legendary: "#FFD700",
  };

  export const classColors = {
    warrior: "#B22222",
    wizard:  "#4B0082",
    rogue:   "#556B2F",
    cleric:  "#2E8B57",
    paladin: "#8B4513",
    archer:  "#228B22",
  };

  export const xpBarColors = { ...classColors };
  ```

- **`src/utils/itemIcons.js`**  
  ```js
  export default {
    "Training Sword":    "https://img.icons8.com/ios-filled/50/000000/sword.png",
    "Apprentice Wand":   "https://img.icons8.com/ios-filled/50/000000/wand.png",
    "Leather Armor":     "https://img.icons8.com/ios-filled/50/000000/chest-plate.png",
    "Simple Boots":      "https://img.icons8.com/ios-filled/50/000000/boot.png",
    "Health Potion":     "https://img.icons8.com/ios-filled/50/000000/potion.png",
    // …and so on for all starting/shop items
  };
  ```

- **`src/utils/statIcons.js`**  
  ```js
  export const statIcons = {
    strength:  "💪",
    agility:   "🏃",
    endurance: "🛡️",
    intellect: "🧠",
    vitality:  "❤️",
    luck:      "🍀",
  };

  export const statTooltips = {
    strength:  "Increases melee damage and XP gains from workouts.",
    agility:   "Improves dodge chance and movement in battle.",
    endurance: "Reduces fatigue penalties in dungeons.",
    intellect: "Buffers spell effects and grants bonus rolls.",
    vitality:  "Increases max health and resistance to status effects.",
    luck:      "Improves chances of finding rare loot in chests.",
  };
  ```

- **`src/components/Tooltip.js`**  
  ```jsx
  import React from "react";

  export default function Tooltip({ children }) {
    return (
      <div className="absolute z-10 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
        {children}
      </div>
    );
  }
  ```

---

## Folder Overview

```
fitness-rpg/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CharacterCard.js
│   │   ├── CharacterCreation.js
│   │   ├── Dashboard.js
│   │   ├── Equipment.js
│   │   ├── Inventory.js
│   │   ├── Login.js
│   │   ├── Quests.js
│   │   ├── Shop.js
│   │   ├── Signup.js
│   │   └── Tooltip.js
│   ├── pages/
│   │   └── Statistics.js
│   ├── utils/
│   │   ├── classOptions.js
│   │   ├── colors.js
│   │   ├── itemIcons.js
│   │   ├── statIcons.js
│   │   ├── stats.js
│   │   ├── updateStatsFromFitness.js
│   │   └── updateXPAndLevel.js
│   ├── firebase.js
│   ├── App.js
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

---

## Future Improvements

- **Mystery Boss / Dungeon System**  
  - Unlock at Level 3: face multiple monster encounters in sequence. Grant temporary buffs for each victory. Tie success to weekly fitness performance (e.g., fewer missed goals → easier boss).  

- **Lore Journal & Quest Board**  
  - Replace the static `QUESTS` array with dynamic quest generation or NPC-driven missions.  
  - Generate a daily Quest Board image by 8 AM EST.  
  - Log lore entries after each major quest in a “Lore Journal” section.  

- **Gear Sets & Bonus Effects**  
  - Support gear sets (e.g., “Emberforged Regalia”): equipping multiple set items grants additional bonuses.  
  - Provide distinct visual styling or mockups when the legendary set is fully collected.  

- **Passive Perk Tree**  
  - Unlock passive abilities as users maintain streaks or hit personal records.  
  - Provide a UI to allocate earned stat points after hitting personal records (e.g., most steps, longest run).  

- **Pet System**  
  - Allow users to collect and bond with pets; pets could grant bonus stats or passive effects.  

- **Faction/Guild System & World Map**  
  - Enable joining a guild for faction-based bonuses.  
  - Implement a world map interface that unlocks new regions (dungeons, towns) based on level or quest progression.  

- **Real-Time Fitness Integration**  
  - Connect to third-party APIs (e.g., Garmin, Apple HealthKit) to automatically pull fitness data.  
  - Provide authorization flows and handle API costs/limits.  

- **Optimizations & Firestore Quota Management**  
  - Batch writes for daily fitness sync instead of on-snapshot listeners.  
  - Debounce high-frequency updates (e.g., equipment changes) to reduce Firestore writes.  

- **Enhanced Charting & Filters**  
  - Add date-range filters (last 7 days, 30 days) on the Statistics page.  
  - Display additional charts: XP per quest category, gear usage over time, weekly streak heatmaps.  

- **UI/UX Refinements**  
  - Add mobile responsiveness and a CSS-in-JS solution (e.g., styled-components) or CSS Modules.  
  - Animate XP bars on level up.  
  - Provide dark mode styling and accessibility features (ARIA labels on tooltips, keyboard navigation).  

---

## License

This project is open-source under the [MIT License](LICENSE). Feel free to fork, contribute, and customize for your own fitness-RPG journey!