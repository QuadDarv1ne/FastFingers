/**
 * Хук для расчёта бонуса XP за серию
 * @param streak - Количество дней подряд
 * @returns Бонусный XP
 */
export function calculateStreakXpBonus(streak: number): number {
  const streakRewards = [
    { days: 3, xpBonus: 50 },
    { days: 7, xpBonus: 150 },
    { days: 14, xpBonus: 400 },
    { days: 30, xpBonus: 1000 },
  ]
  
  const reward = streakRewards.filter(r => r.days <= streak).pop()
  return reward ? reward.xpBonus : 0
}
