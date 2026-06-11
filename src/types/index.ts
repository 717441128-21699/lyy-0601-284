export interface SleepRecord {
  id: string
  date: string
  bedTime: string
  wakeTime: string
  nightWakeCount: number
  napDuration: number
  coffeeIntake: number
  exerciseDuration: number
  score: number
  duration: number
}

export interface Habit {
  id: string
  name: string
  description: string
  icon: string
  targetDays: number
  completedDays: number
  isActive: boolean
  createdAt: string
}

export interface Reminder {
  id: string
  type: 'bedtime' | 'wakeup' | 'screen' | 'abnormal'
  title: string
  time: string
  enabled: boolean
  repeat: string[]
}

export interface TrendData {
  date: string
  score: number
  duration: number
}

export interface RelaxItem {
  id: string
  type: 'breathing' | 'whitenoise' | 'checklist'
  title: string
  description: string
  duration?: number
}

export interface UserProfile {
  name: string
  targetSleepHours: number
  age: number
  gender: 'male' | 'female' | 'other'
}

export interface FactorTip {
  factor: string
  impact: 'positive' | 'negative'
  message: string
}
