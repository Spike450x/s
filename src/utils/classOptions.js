const classOptions = {
  warrior: {
    label: 'Warrior',
    description: 'Strong melee fighter with high strength and vitality.',
    startingStats: { strength: 7, agility: 5, endurance: 6, intellect: 3, vitality: 7, luck: 2 },
    color: '#c0392b',
    avatar: 'https://cdn-icons-png.flaticon.com/512/809/809957.png',
    startingItem: {
      name: 'Training Sword',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Strength',
      description: 'A basic sword for aspiring warriors.',
      strength: 1,
      icon: 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png'
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
      icon: 'https://img.icons8.com/?size=100&id=AeIJucZYFnTd&format=png&color=000000'
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
      icon: 'https://img.icons8.com/?size=100&id=zfKd3xBVOoNr&format=png&color=000000'
    }
  },
  cleric: {
    label: 'Cleric',
    description: 'Holy healer with strong intellect and endurance.',
    startingStats: { strength: 3, agility: 4, endurance: 6, intellect: 7, vitality: 6, luck: 4 },
    color: '#3498db',
    avatar: 'https://cdn-icons-png.flaticon.com/512/1666/1666459.png',
    startingItem: {
      name: 'Healing Staff',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Endurance',
      description: 'A staff imbued with restorative power.',
      endurance: 1,
      icon: 'https://cdn-icons-png.flaticon.com/512/1082/1082138.png'
    }
  },
  paladin: {
    label: 'Paladin',
    description: 'Balanced protector with strength and healing power.',
    startingStats: { strength: 6, agility: 4, endurance: 7, intellect: 5, vitality: 6, luck: 2 },
    color: '#f1c40f',
    avatar: 'https://cdn-icons-png.flaticon.com/512/4341/4341139.png',
    startingItem: {
      name: 'Initiate’s Mace',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Vitality',
      description: 'Heavy and blessed for divine strikes.',
      vitality: 1,
      icon: 'https://cdn-icons-png.flaticon.com/512/869/869886.png'
    }
  },
  archer: {
    label: 'Archer',
    description: 'Precise ranged attacker with high agility and luck.',
    startingStats: { strength: 4, agility: 8, endurance: 5, intellect: 4, vitality: 4, luck: 5 },
    color: '#2ecc71',
    avatar: 'https://cdn-icons-png.flaticon.com/512/1187/1187443.png',
    startingItem: {
      name: 'Training Bow',
      type: 'Weapon',
      rarity: 'Common',
      effect: '+1 Luck',
      description: 'Light bow designed for beginner marksmen.',
      luck: 1,
      icon: 'https://cdn-icons-png.flaticon.com/512/584/584052.png'
    }
  }
};

export default classOptions;
