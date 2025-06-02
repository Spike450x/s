// src/utils/statIcons.js

const statIcons = {
  strength: '💪',
  agility: '🏃',
  endurance: '🛡️',
  intellect: '🧠',
  vitality: '❤️',
  luck: '🍀'
};

const statTooltips = {
  strength: 'Affects physical power and damage.',
  agility: 'Improves speed, dodge rate, and reaction.',
  endurance: 'Increases stamina and defense.',
  intellect: 'Determines magical power and skill efficiency.',
  vitality: 'Boosts max HP and resistance.',
  luck: 'Affects critical hits, loot, and evasion.'
};

// Assign to a named variable before exporting
const statData = { statIcons, statTooltips };

export default statData;
