export const getEffectiveStats = (baseStats, equipped) => {
  const newStats = { ...baseStats };

  for (const key in equipped) {
    const item = equipped[key];
    if (item?.effect) {
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
