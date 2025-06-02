// File: src/utils/stats.js

export const getEffectiveStats = (baseStats, equipped) => {
  const newStats = { ...baseStats };

  // Each equipped item’s `.effect` should be a string like "+2 Strength"
  for (const key in equipped) {
    const item = equipped[key];
    if (item?.effect) {
      // Extract “+number” and stat name
      const match = item.effect.match(/\+(\d+)\s(\w+)/i);
      if (match) {
        const [, value, stat] = match;
        const statKey = stat.toLowerCase();
        if (newStats[statKey] !== undefined) {
          newStats[statKey] += parseInt(value, 10);
        }
      }
    }
  }

  return newStats;
};
