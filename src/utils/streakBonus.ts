const STREAK_REWARDS = [
  { days: 3, xpBonus: 50 },
  { days: 7, xpBonus: 150 },
  { days: 14, xpBonus: 400 },
  { days: 30, xpBonus: 1000 },
] as const

export function calculateStreakXpBonus(streak: number): number {
  let bonus = 0
  for (let i = 0; i < STREAK_REWARDS.length; i++) {
    const reward = STREAK_REWARDS[i]
    if (reward && streak >= reward.days) {
      bonus = reward.xpBonus
    }
  }
  return bonus
}
