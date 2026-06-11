import React, { createContext, useContext, useState, useCallback } from 'react'
import type { SleepRecord, Habit, Reminder, UserProfile } from '@/types'
import { mockSleepRecords, mockHabits, mockReminders, mockUserProfile } from '@/data/mockData'
import { calculateSleepDuration, calculateSleepScore, generateId, formatDate } from '@/utils'

interface SleepContextType {
  records: SleepRecord[]
  habits: Habit[]
  reminders: Reminder[]
  profile: UserProfile
  addRecord: (record: Partial<SleepRecord>) => void
  updateRecord: (id: string, record: Partial<SleepRecord>) => void
  toggleHabit: (id: string) => void
  addHabit: (habit: Partial<Habit>) => void
  toggleReminder: (id: string) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  getTodayRecord: () => SleepRecord | undefined
}

const SleepContext = createContext<SleepContextType | null>(null)

export const SleepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<SleepRecord[]>(mockSleepRecords)
  const [habits, setHabits] = useState<Habit[]>(mockHabits)
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders)
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile)

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
    setRecords(prev => {
      const existing = prev.findIndex(r => r.date === today)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], ...newRecord, id: updated[existing].id }
        return updated
      }
      return [...prev, newRecord]
    })
  }, [])

  const updateRecord = useCallback((id: string, record: Partial<SleepRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...record } : r))
  }, [])

  const toggleHabit = useCallback((id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const newCompleted = h.isActive ? h.completedDays : h.completedDays + 1
      return { ...h, isActive: !h.isActive, completedDays: newCompleted }
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
    setHabits(prev => [...prev, newHabit])
  }, [])

  const toggleReminder = useCallback((id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }, [])

  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }))
  }, [])

  const getTodayRecord = useCallback((): SleepRecord | undefined => {
    const today = formatDate(new Date())
    return records.find(r => r.date === today)
  }, [records])

  return (
    <SleepContext.Provider value={{
      records,
      habits,
      reminders,
      profile,
      addRecord,
      updateRecord,
      toggleHabit,
      addHabit,
      toggleReminder,
      updateProfile,
      getTodayRecord
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
