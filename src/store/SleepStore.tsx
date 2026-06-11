import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import type { SleepRecord, Habit, Reminder, UserProfile, ImprovementPlan, DailyGoal } from '@/types'
import { mockSleepRecords, mockHabits, mockReminders, mockUserProfile } from '@/data/mockData'
import { calculateSleepDuration, calculateSleepScore, generateId, formatDate } from '@/utils'

const STORAGE_KEY = 'sleep_app_data_v1'

interface StoredData {
  records: SleepRecord[]
  habits: Habit[]
  reminders: Reminder[]
  profile: UserProfile
  improvementPlan: ImprovementPlan | null
}

const loadFromStorage = (): StoredData => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY)
    if (data) {
      console.log('[Store] Loaded data from storage')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('[Store] Failed to load from storage', e)
  }
  return {
    records: mockSleepRecords,
    habits: mockHabits,
    reminders: mockReminders,
    profile: mockUserProfile,
    improvementPlan: null
  }
}

const saveToStorage = (data: StoredData) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    console.log('[Store] Saved data to storage')
  } catch (e) {
    console.error('[Store] Failed to save to storage', e)
  }
}

interface SleepContextType {
  records: SleepRecord[]
  habits: Habit[]
  reminders: Reminder[]
  profile: UserProfile
  editingDate: string | null
  improvementPlan: ImprovementPlan | null
  addRecord: (record: Partial<SleepRecord>) => void
  updateRecord: (id: string, record: Partial<SleepRecord>) => void
  toggleHabit: (id: string) => void
  addHabit: (habit: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleReminder: (id: string) => void
  addReminder: (reminder: Partial<Reminder>) => void
  updateReminder: (id: string, reminder: Partial<Reminder>) => void
  deleteReminder: (id: string) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  getTodayRecord: () => SleepRecord | undefined
  setEditingDate: (date: string | null) => void
  generateImprovementPlan: () => void
  toggleDailyGoal: (goalId: string) => void
  resetImprovementPlan: () => void
  resetData: () => void
}

const SleepContext = createContext<SleepContextType | null>(null)

export const SleepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoredData>(() => loadFromStorage())
  const [editingDate, setEditingDate] = useState<string | null>(null)

  useEffect(() => {
    saveToStorage(data)
  }, [data])

  const addRecord = useCallback((record: Partial<SleepRecord>) => {
    const targetDate = record.date || formatDate(new Date())
    const bedTime = record.bedTime || '23:00'
    const wakeTime = record.wakeTime || '07:00'
    const duration = calculateSleepDuration(bedTime, wakeTime)
    const score = calculateSleepScore({
      duration,
      nightWakeCount: record.nightWakeCount || 0,
      napDuration: record.napDuration || 0,
      coffeeIntake: record.coffeeIntake || 0,
      exerciseDuration: record.exerciseDuration || 0
    })
    const newRecord: SleepRecord = {
      id: generateId(),
      date: targetDate,
      bedTime,
      wakeTime,
      nightWakeCount: record.nightWakeCount || 0,
      napDuration: record.napDuration || 0,
      coffeeIntake: record.coffeeIntake || 0,
      exerciseDuration: record.exerciseDuration || 0,
      duration,
      score
    }
    setData(prev => {
      const existing = prev.records.findIndex(r => r.date === targetDate)
      let newRecords: SleepRecord[]
      if (existing >= 0) {
        newRecords = [...prev.records]
        newRecords[existing] = { ...newRecords[existing], ...newRecord, id: newRecords[existing].id }
      } else {
        newRecords = [...prev.records, newRecord]
      }
      return { ...prev, records: newRecords }
    })
  }, [])

  const updateRecord = useCallback((id: string, record: Partial<SleepRecord>) => {
    setData(prev => ({
      ...prev,
      records: prev.records.map(r => r.id === id ? { ...r, ...record } : r)
    }))
  }, [])

  const toggleHabit = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id !== id) return h
        const newCompleted = h.isActive ? h.completedDays : h.completedDays + 1
        return { ...h, isActive: !h.isActive, completedDays: newCompleted }
      })
    }))
  }, [])

  const addHabit = useCallback((habit: Partial<Habit>) => {
    const newHabit: Habit = {
      id: generateId(),
      name: habit.name || '新习惯',
      description: habit.description || '',
      icon: habit.icon || '✨',
      targetDays: habit.targetDays || 21,
      completedDays: 0,
      isActive: false,
      createdAt: formatDate(new Date())
    }
    setData(prev => ({ ...prev, habits: [...prev.habits, newHabit] }))
  }, [])

  const deleteHabit = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }))
  }, [])

  const toggleReminder = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    }))
  }, [])

  const addReminder = useCallback((reminder: Partial<Reminder>) => {
    const newReminder: Reminder = {
      id: generateId(),
      type: reminder.type || 'bedtime',
      title: reminder.title || '新提醒',
      time: reminder.time || '08:00',
      enabled: reminder.enabled !== undefined ? reminder.enabled : true,
      repeat: reminder.repeat || ['每天']
    }
    setData(prev => ({ ...prev, reminders: [...prev.reminders, newReminder] }))
  }, [])

  const updateReminder = useCallback((id: string, reminder: Partial<Reminder>) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, ...reminder } : r)
    }))
  }, [])

  const deleteReminder = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== id)
    }))
  }, [])

  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...newProfile }
    }))
  }, [])

  const getTodayRecord = useCallback((): SleepRecord | undefined => {
    const today = formatDate(new Date())
    return data.records.find(r => r.date === today)
  }, [data.records])

  const generateImprovementPlan = useCallback(() => {
    const last7 = data.records.slice(-7)
    const avgCoffee = last7.length > 0
      ? last7.reduce((s, r) => s + r.coffeeIntake, 0) / last7.length
      : 1
    const avgExercise = last7.length > 0
      ? last7.reduce((s, r) => s + r.exerciseDuration, 0) / last7.length
      : 30
    const avgWake = last7.length > 0
      ? last7.reduce((s, r) => s + r.nightWakeCount, 0) / last7.length
      : 1
    const avgNap = last7.length > 0
      ? last7.reduce((s, r) => s + r.napDuration, 0) / last7.length
      : 30
    const avgScore = last7.length > 0
      ? last7.reduce((s, r) => s + r.score, 0) / last7.length
      : 70

    const today = formatDate(new Date())

    const goalTemplates: Array<{ title: string; description: string; icon: string; category: DailyGoal['category']; condition: boolean }> = [
      { title: '减少咖啡摄入', description: '下午3点后不喝咖啡，每天不超过2杯', icon: '☕', category: 'coffee', condition: avgCoffee > 1.5 },
      { title: '增加运动时间', description: '每天保持30分钟中等强度有氧运动', icon: '🏃', category: 'exercise', condition: avgExercise < 25 },
      { title: '减少夜醒次数', description: '睡前避免大量饮水，保持卧室舒适温度', icon: '😴', category: 'sleep', condition: avgWake > 1.5 },
      { title: '控制午睡时长', description: '午睡控制在30分钟内，避免影响夜间睡眠', icon: '💤', category: 'nap', condition: avgNap > 40 },
      { title: '提前上床时间', description: '每天提前15分钟上床，逐步调整到23点前入睡', icon: '🛏️', category: 'sleep', condition: avgScore < 70 },
      { title: '睡前远离屏幕', description: '睡前1小时放下手机，可听轻音乐助眠', icon: '📱', category: 'screen', condition: true }
    ]

    const selectedGoals = goalTemplates.filter(g => g.condition).slice(0, 4)
    if (selectedGoals.length < 4) {
      const backupGoals = goalTemplates.filter(g => !g.condition).slice(0, 4 - selectedGoals.length)
      selectedGoals.push(...backupGoals)
    }

    const goals: DailyGoal[] = selectedGoals.slice(0, 4).map((goal, idx) => ({
      id: generateId(),
      day: idx + 1,
      title: goal.title,
      description: goal.description,
      icon: goal.icon,
      category: goal.category,
      completed: false
    }))

    const plan: ImprovementPlan = {
      startDate: today,
      goals,
      generatedAt: new Date().toISOString()
    }

    setData(prev => ({ ...prev, improvementPlan: plan }))
    console.log('[Store] Generated improvement plan with', goals.length, 'goals')
  }, [data.records])

  const toggleDailyGoal = useCallback((goalId: string) => {
    setData(prev => {
      if (!prev.improvementPlan) return prev

      const newGoals = prev.improvementPlan.goals.map(g => {
        if (g.id !== goalId) return g
        const completed = !g.completed
        if (completed && !g.completed) {
          const habitName = `改善计划：${g.title}`
          const existingHabit = prev.habits.find(h => h.name === habitName)
          if (!existingHabit) {
            setTimeout(() => {
              addHabit({
                name: habitName,
                description: g.description,
                icon: g.icon,
                targetDays: 7
              })
            }, 0)
          } else {
            setTimeout(() => {
              toggleHabit(existingHabit.id)
            }, 0)
          }
        }
        return {
          ...g,
          completed,
          completedAt: completed ? formatDate(new Date()) : undefined
        }
      })

      return {
        ...prev,
        improvementPlan: {
          ...prev.improvementPlan,
          goals: newGoals
        }
      }
    })
  }, [addHabit, toggleHabit])

  const resetImprovementPlan = useCallback(() => {
    setData(prev => ({ ...prev, improvementPlan: null }))
    Taro.showToast({ title: '已重置计划', icon: 'success' })
  }, [])

  const resetData = useCallback(() => {
    Taro.removeStorageSync(STORAGE_KEY)
    setData({
      records: mockSleepRecords,
      habits: mockHabits,
      reminders: mockReminders,
      profile: mockUserProfile,
      improvementPlan: null
    })
    setEditingDate(null)
    Taro.showToast({ title: '数据已重置', icon: 'success' })
  }, [])

  return (
    <SleepContext.Provider value={{
      records: data.records,
      habits: data.habits,
      reminders: data.reminders,
      profile: data.profile,
      editingDate,
      improvementPlan: data.improvementPlan,
      addRecord,
      updateRecord,
      toggleHabit,
      addHabit,
      deleteHabit,
      toggleReminder,
      addReminder,
      updateReminder,
      deleteReminder,
      updateProfile,
      getTodayRecord,
      setEditingDate,
      generateImprovementPlan,
      toggleDailyGoal,
      resetImprovementPlan,
      resetData
    }}>
      {children}
    </SleepContext.Provider>
  )
}

export const useSleepStore = (): SleepContextType => {
  const ctx = useContext(SleepContext)
  if (!ctx) throw new Error('useSleepStore must be used within SleepProvider')
  return ctx
}
