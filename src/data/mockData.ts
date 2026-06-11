import type { SleepRecord, Habit, Reminder, RelaxItem, FactorTip, UserProfile } from '@/types'

export const mockUserProfile: UserProfile = {
  name: '睡眠达人',
  targetSleepHours: 8,
  age: 28,
  gender: 'male'
}

const generateSleepRecords = (): SleepRecord[] => {
  const records: SleepRecord[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const bedHour = 22 + Math.floor(Math.random() * 3)
    const bedMin = Math.floor(Math.random() * 60)
    const wakeHour = 6 + Math.floor(Math.random() * 2)
    const wakeMin = Math.floor(Math.random() * 60)
    const bedTime = `${String(bedHour).padStart(2, '0')}:${String(bedMin).padStart(2, '0')}`
    const wakeTime = `${String(wakeHour).padStart(2, '0')}:${String(wakeMin).padStart(2, '0')}`
    const nightWakeCount = Math.floor(Math.random() * 4)
    const napDuration = Math.floor(Math.random() * 90)
    const coffeeIntake = Math.floor(Math.random() * 5)
    const exerciseDuration = Math.floor(Math.random() * 120)
    const [bedH, bedM] = bedTime.split(':').map(Number)
    const [wakeH, wakeM] = wakeTime.split(':').map(Number)
    let bedMinutes = bedH * 60 + bedM
    let wakeMinutes = wakeH * 60 + wakeM
    if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60
    const duration = Math.round((wakeMinutes - bedMinutes) / 60 * 10) / 10
    let score = 100
    if (duration >= 7 && duration <= 9) score += 5
    else if (duration < 6) score -= 20
    else if (duration > 10) score -= 10
    score -= nightWakeCount * 8
    if (napDuration > 60) score -= 10
    if (coffeeIntake > 3) score -= 15
    if (exerciseDuration >= 30 && exerciseDuration <= 90) score += 5
    score = Math.max(0, Math.min(100, Math.round(score)))
    records.push({
      id: `rec_${i}`,
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      bedTime,
      wakeTime,
      nightWakeCount,
      napDuration,
      coffeeIntake,
      exerciseDuration,
      score,
      duration
    })
  }
  return records
}

export const mockSleepRecords: SleepRecord[] = generateSleepRecords()

export const mockHabits: Habit[] = [
  {
    id: 'habit_1',
    name: '睡前远离电子设备',
    description: '睡前1小时不看手机、电脑等电子屏幕',
    icon: '📵',
    targetDays: 21,
    completedDays: 12,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'habit_2',
    name: '固定时间睡觉',
    description: '每天在同一时间上床睡觉，培养生物钟',
    icon: '⏰',
    targetDays: 30,
    completedDays: 8,
    isActive: true,
    createdAt: '2024-01-05'
  },
  {
    id: 'habit_3',
    name: '睡前冥想放松',
    description: '睡前进行10分钟冥想或深呼吸练习',
    icon: '🧘',
    targetDays: 14,
    completedDays: 5,
    isActive: true,
    createdAt: '2024-01-10'
  },
  {
    id: 'habit_4',
    name: '避免午后咖啡',
    description: '下午3点后不再摄入咖啡因',
    icon: '☕',
    targetDays: 21,
    completedDays: 15,
    isActive: false,
    createdAt: '2024-01-01'
  }
]

export const mockReminders: Reminder[] = [
  {
    id: 'rem_1',
    type: 'bedtime',
    title: '就寝提醒',
    time: '22:30',
    enabled: true,
    repeat: ['周一', '周二', '周三', '周四', '周日']
  },
  {
    id: 'rem_2',
    type: 'wakeup',
    title: '起床闹钟',
    time: '06:30',
    enabled: true,
    repeat: ['周一', '周二', '周三', '周四', '周五']
  },
  {
    id: 'rem_3',
    type: 'screen',
    title: '睡前屏幕关闭提示',
    time: '21:30',
    enabled: false,
    repeat: ['每天']
  },
  {
    id: 'rem_4',
    type: 'abnormal',
    title: '异常连续睡眠提醒',
    time: '08:00',
    enabled: true,
    repeat: ['每天']
  }
]

export const mockRelaxItems: RelaxItem[] = [
  {
    id: 'relax_1',
    type: 'breathing',
    title: '4-7-8 呼吸法',
    description: '吸气4秒，屏息7秒，呼气8秒，快速放松身心',
    duration: 5
  },
  {
    id: 'relax_2',
    type: 'breathing',
    title: '腹式呼吸',
    description: '深呼吸至腹部，帮助平静思绪进入睡眠状态',
    duration: 10
  },
  {
    id: 'relax_3',
    type: 'whitenoise',
    title: '雨声',
    description: '柔和的淅沥雨声，帮助快速入眠',
    duration: 30
  },
  {
    id: 'relax_4',
    type: 'whitenoise',
    title: '海浪声',
    description: '舒缓的海浪拍岸声，营造海边度假氛围',
    duration: 30
  },
  {
    id: 'relax_5',
    type: 'whitenoise',
    title: '森林鸟鸣',
    description: '清晨森林中的鸟鸣，自然清新',
    duration: 30
  },
  {
    id: 'relax_6',
    type: 'checklist',
    title: '睡前准备清单',
    description: '助眠准备事项，确保睡眠环境舒适'
  }
]

export const mockChecklistItems = [
  { id: 'c1', text: '关闭主灯，开启暖光小夜灯', checked: true },
  { id: 'c2', text: '调节室温至20-22°C', checked: true },
  { id: 'c3', text: '放下手机，调至静音模式', checked: false },
  { id: 'c4', text: '喝一小杯温水', checked: false },
  { id: 'c5', text: '做一组简单拉伸', checked: false },
  { id: 'c6', text: '回顾今日感恩事项', checked: false },
  { id: 'c7', text: '准备好明天要穿的衣物', checked: false }
]
