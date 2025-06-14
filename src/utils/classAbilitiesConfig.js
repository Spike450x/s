// Defines cost, cooldown (ms), and resource type per ability
export const classAbilities = {
  Warrior: {
    resource: 'battlePoints',
    active: {
      powerStrike: { cost: 5, cooldown: 600000 }  // 10 minutes
    }
  },
  Archer: {
    resource: 'focusPoints',
    active: {
      rainOfArrows: { cost: 10, cooldown: 86400000 } // 1 day / per quest
    }
  },
  Rogue: {
    resource: 'sneakPoints',
    active: {
      backstab: { cost: 3, cooldown: 600000 }
    }
  },
  Wizard: {
    resource: 'mana',
    active: {
      arcaneBolt: { cost: 5, cooldown: 300000 }
    }
  },
  Paladin: {
    resource: 'faithPoints',
    active: {
      holySmite: { cost: 4, cooldown: 86400000 }
    }
  },
  Cleric: {
    resource: 'mana',
    active: {
      healingLight: { cost: 4, cooldown: 86400000 }
    }
  }
};
