import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import type { SleepRecord, Habit, Reminder, UserProfile } from '@/types'
import { mockSleepRecords, mockHabits, mockReminders, mockUserProfile } from '@/data/mockData'
import { calculateSleepDuration, calculateSleepScore, generateId, formatDate } from '@/utils'

const STORAGE_KEY = 'sleep_app_data_v1'

interface StoredData {
  records: SleepRecord[]
  habits: Habit[]
  reminders: Reminder[]
  profile: UserProfile
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
    profile: mockUserProfile
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
  resetData: () => void
}

const SleepContext = createContext<SleepContextType | null>(null)

export const SleepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoredData>(() => loadFromStorage())

  useEffect(() => {
    saveToStorage(data)
  }, [data])

  const addRecord = useCallback((record: Partial<SleepRecord>) => {
    const today = formatDate(new Date())
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
      date: today,
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
      const existing = prev.records.findIndex(r => r.date === today)
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

  const resetData = useCallback(() => {
    Taro.removeStorageSync(STORAGE_KEY)
    setData({
      records: mockSleepRecords,
      habits: mockHabits,
      reminders: mockReminders,
      profile: mockUserProfile
    })
    Taro.showToast({ title: '数据已重置', icon: 'success' })
  }, [])

  return (
    <SleepContext.Provider value={{
      records: data.records,
      habits: data.habits,
      reminders: data.reminders,
      profile: data.profile,
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
