import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import SleepScoreCard from '@/components/SleepScoreCard'
import RecordItem from '@/components/RecordItem'
import { useSleepStore } from '@/store/SleepStore'
import { getFactorTips, formatDate } from '@/utils'
import styles from './index.module.scss'

const RecordPage: React.FC = () => {
  const router = useRouter()
  const { records, habits, addRecord, updateRecord, editingDate: storeEditingDate, setEditingDate: setStoreEditingDate } = useSleepStore()
  const today = formatDate(new Date())
  const urlDate = router.params.date
  const [editingDate, setEditingDate] = useState(urlDate || today)

  useDidShow(() => {
    if (storeEditingDate) {
      setEditingDate(storeEditingDate)
      console.log('[Record] Got editing date from store:', storeEditingDate)
    }
  })

  useEffect(() => {
    if (urlDate) {
      setEditingDate(urlDate)
    }
  }, [urlDate])

  useEffect(() => {
    if (storeEditingDate && storeEditingDate !== editingDate) {
      setEditingDate(storeEditingDate)
    }
  }, [storeEditingDate])

  const existingRecord = useMemo(() => {
    return records.find(r => r.date === editingDate)
  }, [records, editingDate])

  const [bedTime, setBedTime] = useState(existingRecord?.bedTime || '23:00')
  const [wakeTime, setWakeTime] = useState(existingRecord?.wakeTime || '07:00')
  const [nightWakeCount, setNightWakeCount] = useState(existingRecord?.nightWakeCount || 0)
  const [napDuration, setNapDuration] = useState(existingRecord?.napDuration || 0)
  const [coffeeIntake, setCoffeeIntake] = useState(existingRecord?.coffeeIntake || 1)
  const [exerciseDuration, setExerciseDuration] = useState(existingRecord?.exerciseDuration || 30)

  useEffect(() => {
    if (existingRecord) {
      setBedTime(existingRecord.bedTime)
      setWakeTime(existingRecord.wakeTime)
      setNightWakeCount(existingRecord.nightWakeCount)
      setNapDuration(existingRecord.napDuration)
      setCoffeeIntake(existingRecord.coffeeIntake)
      setExerciseDuration(existingRecord.exerciseDuration)
    } else {
      setBedTime('23:00')
      setWakeTime('07:00')
      setNightWakeCount(0)
      setNapDuration(0)
      setCoffeeIntake(1)
      setExerciseDuration(30)
    }
  }, [existingRecord?.id, editingDate])

  const computedScore = useMemo(() => {
    const { calculateSleepDuration, calculateSleepScore } = require('@/utils')
    const duration = calculateSleepDuration(bedTime, wakeTime)
    return calculateSleepScore({
      duration,
      nightWakeCount,
      napDuration,
      coffeeIntake,
      exerciseDuration
    })
  }, [bedTime, wakeTime, nightWakeCount, napDuration, coffeeIntake, exerciseDuration])

  const computedDuration = useMemo(() => {
    const { calculateSleepDuration } = require('@/utils')
    return calculateSleepDuration(bedTime, wakeTime)
  }, [bedTime, wakeTime])

  const recentRecords = useMemo(() => records.slice(-7), [records])
  const factorTips = useMemo(() => getFactorTips(recentRecords), [recentRecords])

  const handleBedTime = () => {
    Taro.showActionSheet({
      itemList: ['21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30'],
      success: (res) => {
        const times = ['21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30']
        setBedTime(times[res.tapIndex])
      }
    })
  }

  const handleWakeTime = () => {
    Taro.showActionSheet({
      itemList: ['05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00'],
      success: (res) => {
        const times = ['05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00']
        setWakeTime(times[res.tapIndex])
      }
    })
  }

  const handleDateChange = () => {
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(formatDate(d))
    }
    Taro.showActionSheet({
      itemList: dates.map(d => d === today ? `${d} (今天)` : d),
      success: (res) => {
        const newDate = dates[res.tapIndex]
        setEditingDate(newDate)
        console.log('[Record] Switched date to', newDate)
      }
    })
  }

  const handleSave = () => {
    if (existingRecord) {
      const { calculateSleepDuration, calculateSleepScore } = require('@/utils')
      const duration = calculateSleepDuration(bedTime, wakeTime)
      const score = calculateSleepScore({
        duration,
        nightWakeCount,
        napDuration,
        coffeeIntake,
        exerciseDuration
      })
      updateRecord(existingRecord.id, {
        bedTime,
        wakeTime,
        nightWakeCount,
        napDuration,
        coffeeIntake,
        exerciseDuration,
        duration,
        score
      })
    } else {
      addRecord({
        date: editingDate,
        bedTime,
        wakeTime,
        nightWakeCount,
        napDuration,
        coffeeIntake,
        exerciseDuration
      })
    }
    Taro.showToast({ title: '已保存', icon: 'success' })
    console.log('[Record] Saved sleep record for', editingDate, { bedTime, wakeTime, nightWakeCount, napDuration, coffeeIntake, exerciseDuration })
  }

  const gotoHabits = () => {
    Taro.navigateTo({ url: '/pages/habits/index' })
  }

  const goToTrends = () => {
    Taro.switchTab({ url: '/pages/trends/index' })
  }

  const isEditingToday = editingDate === today

  return (
    <View className={styles.page}>
      <View className={styles.greeting}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text className={styles.greetingText}>
            {isEditingToday ? '睡眠记录 🌙' : `${editingDate} 记录`}
          </Text>
          <Button
            className={styles.sectionAction}
            onClick={handleDateChange}
            style={{ marginBottom: 0 }}
          >
            切换日期
          </Button>
        </View>
        <Text className={styles.subText}>
          {isEditingToday ? '记录昨晚睡眠，了解你的健康状态' : '正在编辑历史记录'}
          {existingRecord && '（已有记录）'}
        </Text>
      </View>

      <View className={styles.section}>
        <SleepScoreCard
          score={computedScore}
          duration={computedDuration}
          bedTime={bedTime}
          wakeTime={wakeTime}
        />
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>睡眠时间</Text>
        </View>
        <View className={styles.recordCard}>
          <View className={styles.timeInputs}>
            <View className={styles.timeInput} onClick={handleBedTime}>
              <Text className={styles.timeLabel}>入睡时间</Text>
              <Text className={styles.timeValue}>{bedTime}</Text>
            </View>
            <View className={styles.timeInput} onClick={handleWakeTime}>
              <Text className={styles.timeLabel}>起床时间</Text>
              <Text className={styles.timeValue}>{wakeTime}</Text>
            </View>
          </View>
          <RecordItem
            icon="😴"
            label="夜醒次数"
            desc="夜间醒来的次数"
            value={nightWakeCount}
            unit="次"
            showControl
            onIncrease={() => setNightWakeCount(v => Math.min(10, v + 1))}
            onDecrease={() => setNightWakeCount(v => Math.max(0, v - 1))}
          />
          <RecordItem
            icon="💤"
            label="午睡时长"
            desc="白天小睡的总时长"
            value={napDuration}
            unit="分钟"
            showControl
            onIncrease={() => setNapDuration(v => Math.min(180, v + 15))}
            onDecrease={() => setNapDuration(v => Math.max(0, v - 15))}
          />
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>生活习惯</Text>
        </View>
        <View className={styles.recordCard}>
          <RecordItem
            icon="☕"
            label="咖啡摄入"
            desc="含咖啡因的饮品杯数"
            value={coffeeIntake}
            unit="杯"
            showControl
            onIncrease={() => setCoffeeIntake(v => Math.min(10, v + 1))}
            onDecrease={() => setCoffeeIntake(v => Math.max(0, v - 1))}
          />
          <RecordItem
            icon="🏃"
            label="运动时长"
            desc="今日运动总时长"
            value={exerciseDuration}
            unit="分钟"
            showControl
            onIncrease={() => setExerciseDuration(v => Math.min(240, v + 15))}
            onDecrease={() => setExerciseDuration(v => Math.max(0, v - 15))}
          />
        </View>
      </View>

      {factorTips.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>影响因素提示</Text>
          </View>
          <View className={styles.tipsCard}>
            {factorTips.map((tip, idx) => (
              <View className={styles.tipItem} key={idx}>
                <View className={`${styles.tipIcon} ${tip.impact === 'positive' ? styles.tipPositive : styles.tipNegative}`}>
                  <Text>{tip.impact === 'positive' ? '✓' : '!'}</Text>
                </View>
                <View className={styles.tipContent}>
                  <Text className={styles.tipFactor}>{tip.factor}</Text>
                  <Text className={styles.tipMsg}>{tip.message}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>今日习惯</Text>
          <Button className={styles.sectionAction} onClick={gotoHabits}>查看全部</Button>
        </View>
        <ScrollView scrollX className={styles.habitPreview}>
          {habits.filter(h => h.isActive).slice(0, 4).map(habit => (
            <View className={styles.habitMini} key={habit.id}>
              <View className={styles.habitMiniIcon}>
                <Text>{habit.icon}</Text>
              </View>
              <Text className={styles.habitMiniName}>{habit.name}</Text>
              <View className={styles.habitMiniProgress}>
                <View
                  className={styles.habitMiniFill}
                  style={{ width: `${Math.min(100, (habit.completedDays / habit.targetDays) * 100)}%` }}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Button className={styles.saveBtn} onClick={handleSave}>
        保存{isEditingToday ? '今日' : ''}记录
      </Button>
    </View>
  )
}

export default RecordPage
