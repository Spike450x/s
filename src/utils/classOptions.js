const classOptions = {
  warrior: {
    label: 'Warrior',
    description: 'Strong melee fighter with high strength and vitality.',
    startingStats: { strength: 7, agility: 5, endurance: 6, intellect: 3, vitality: 7, luck: 2 },
    color: '#c0392b',
    avatar: 'https://img.icons8.com/?size=100&id=rrc6klXbnGxP&format=png&color=000000',
    startingItem: {
      name: 'Training Sword',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Strength',
      description: 'A basic sword for aspiring warriors.',
      strength: 1,
      icon: 'https://img.icons8.com/?size=100&id=6Or3STDYuLF6&format=png&color=000000'
    }
  },
  wizard: {
    label: 'Wizard',
    description: 'Master of magic with high intellect and ranged spells.',
    startingStats: { strength: 2, agility: 4, endurance: 4, intellect: 9, vitality: 4, luck: 4 },
    color: '#8e44ad',
    avatar: 'https://img.icons8.com/?size=100&id=AeIJucZYFnTd&format=png&color=000000',
    startingItem: {
      name: 'Apprentice Wand',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Intellect',
      description: 'A wand that hums with faint magical energy.',
      intellect: 1,
      icon: 'https://img.icons8.com/?size=100&id=12133&format=png&color=000000'
    }
  },
  rogue: {
    label: 'Rogue',
    description: 'Quick and agile, masters of stealth and critical hits.',
    startingStats: { strength: 4, agility: 9, endurance: 5, intellect: 3, vitality: 4, luck: 5 },
    color: '#27ae60',
    avatar: 'https://img.icons8.com/?size=100&id=zfKd3xBVOoNr&format=png&color=000000',
    startingItem: {
      name: 'Dagger of Practice',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Agility',
      description: 'Lightweight and sharp, perfect for quick attacks.',
      agility: 1,
      icon: 'https://img.icons8.com/?size=100&id=l713Qw9FrsAc&format=png&color=000000'
    }
  },
  cleric: {
    label: 'Cleric',
    description: 'Holy healer with strong intellect and endurance.',
    startingStats: { strength: 3, agility: 4, endurance: 6, intellect: 7, vitality: 6, luck: 4 },
    color: '#3498db',
    avatar: 'https://img.icons8.com/?size=100&id=jyDo66R8nY6j&format=png&color=000000',
    startingItem: {
      name: 'Healing Staff',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Endurance',
      description: 'A staff imbued with restorative power.',
      endurance: 1,
      icon: 'https://img.icons8.com/?size=100&id=opT4Hz_Kcfh9&format=png&color=000000'
    }
  },
  paladin: {
    label: 'Paladin',
    description: 'Balanced protector with strength and healing power.',
    startingStats: { strength: 6, agility: 4, endurance: 7, intellect: 5, vitality: 6, luck: 2 },
    color: '#f1c40f',
    avatar: 'https://img.icons8.com/?size=100&id=TpzP5e2XdAnK&format=png&color=000000',
    startingItem: {
      name: 'Initiate’s Mace',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Vitality',
      description: 'Heavy and blessed for divine strikes.',
      vitality: 1,
      icon: 'https://img.icons8.com/?size=100&id=uR6n7ynAYP5z&format=png&color=000000'
    }
  },
  archer: {
    label: 'Archer',
    description: 'Precise ranged attacker with high agility and luck.',
    startingStats: { strength: 4, agility: 8, endurance: 5, intellect: 4, vitality: 4, luck: 5 },
    color: '#2ecc71',
    avatar: 'https://img.icons8.com/?size=100&id=mqOnDt64R8Fk&format=png&color=000000',
    startingItem: {
      name: 'Training Bow',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Luck',
      description: 'Light bow designed for beginner marksmen.',
      luck: 1,
      icon: 'https://img.icons8.com/?size=100&id=81316&format=png&color=000000'
    }
  }
};

export default classOptions;
