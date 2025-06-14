// src/utils/spellbookUtils.js

export const SPELLBOOK_LIST = [
  {
    id: 'fireball',
    name: 'Fireball',
    image: '/images/spellbooks/fireball.png',
    description: 'A blazing tome that scorches foes.',
    effect: 'Instantly deal 10 fire damage',
  },
  {
    id: 'iceshard',
    name: 'Ice Shard',
    image: '/images/spellbooks/iceshard.png',
    description: 'A chilling scroll of frost.',
    effect: 'Deal 8 damage and slow the enemy',
  },
  {
    id: 'lightningbolt',
    name: 'Lightning Bolt',
    image: '/images/spellbooks/lightningbolt.png',
    description: 'A crackling book of lightning.',
    effect: 'Deal 12 lightning damage',
  },
  {
    id: 'heal',
    name: 'Heal',
    image: '/images/spellbooks/heal.png',
    description: 'Restorative runes to mend wounds.',
    effect: 'Restore 10 HP',
  },
  {
    id: 'windgust',
    name: 'Wind Gust',
    image: '/images/spellbooks/windgust.png',
    description: 'A breezy parchment.',
    effect: 'Knock back enemies',
  },
  {
    id: 'stonewall',
    name: 'Stone Wall',
    image: '/images/spellbooks/stonewall.png',
    description: 'Earthen wards for defense.',
    effect: 'Gain a temporary shield',
  },
];

/**
 * Returns `count` unique, randomly selected spellbooks
 */
export function getRandomSpellbookOptions(count = 3) {
  // make a shallow copy and shuffle
  const shuffled = SPELLBOOK_LIST
    .map((s) => ({ sort: Math.random(), value: s }))
    .sort((a, b) => a.sort - b.sort)
    .map((i) => i.value);
  return shuffled.slice(0, count);
}
