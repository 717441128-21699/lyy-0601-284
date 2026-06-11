export const calculateSleepDuration = (bedTime: string, wakeTime: string): number => {
  const [bedH, bedM] = bedTime.split(':').map(Number)
  const [wakeH, wakeM] = wakeTime.split(':').map(Number)
  let bedMinutes = bedH * 60 + bedM
  let wakeMinutes = wakeH * 60 + wakeM
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60
  }
  return Math.round((wakeMinutes - bedMinutes) / 60 * 10) / 10
}

export const calculateSleepScore = (record: {
  duration: number
  nightWakeCount: number
  napDuration: number
  coffeeIntake: number
  exerciseDuration: number
}): number => {
  let score = 100
  const { duration, nightWakeCount, napDuration, coffeeIntake, exerciseDuration } = record
  if (duration >= 7 && duration <= 9) score += 5
  else if (duration < 6) score -= 20
  else if (duration > 10) score -= 10
  else score -= Math.abs(7.5 - duration) * 5
  score -= nightWakeCount * 8
  if (napDuration > 60) score -= 10
  else if (napDuration > 30) score -= 5
  if (coffeeIntake > 3) score -= 15
  else if (coffeeIntake > 1) score -= 5
  if (exerciseDuration >= 30 && exerciseDuration <= 90) score += 5
  else if (exerciseDuration > 120) score -= 5
  return Math.max(0, Math.min(100, Math.round(score)))
}

export const getSleepQuality = (score: number): { text: string; color: string } => {
  if (score >= 80) return { text: '优质', color: '#52C41A' }
  if (score >= 60) return { text: '良好', color: '#FAAD14' }
  if (score >= 40) return { text: '一般', color: '#FF7D00' }
  return { text: '较差', color: '#FF4D4F' }
}

export const getFactorTips = (records: any[]): any[] => {
  const tips: any[] = []
  if (records.length === 0) return tips
  const avgScore = records.reduce((s, r) => s + r.score, 0) / records.length
  const avgCoffee = records.reduce((s, r) => s + r.coffeeIntake, 0) / records.length
  const avgExercise = records.reduce((s, r) => s + r.exerciseDuration, 0) / records.length
  if (avgCoffee > 2) {
    tips.push({ factor: '咖啡摄入', impact: 'negative', message: '近期咖啡摄入偏多，建议下午3点后避免饮用' })
  }
  if (avgExercise < 20) {
    tips.push({ factor: '运动时长', impact: 'negative', message: '运动量不足，建议每天保持30分钟有氧运动' })
  }
  if (avgScore < 60) {
    tips.push({ factor: '整体睡眠', impact: 'negative', message: '睡眠质量需要改善，建议调整作息规律' })
  }
  if (avgScore >= 80) {
    tips.push({ factor: '睡眠状态', impact: 'positive', message: '睡眠状态良好，继续保持当前作息习惯' })
  }
  return tips
}

export const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}
