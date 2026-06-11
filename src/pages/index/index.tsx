import React, { useState, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import SleepScoreCard from '@/components/SleepScoreCard'
import RecordItem from '@/components/RecordItem'
import { useSleepStore } from '@/store/SleepStore'
import { getFactorTips } from '@/utils'
import styles from './index.module.scss'

const RecordPage: React.FC = () => {
  const { records, habits, getTodayRecord, addRecord } = useSleepStore()
  const today = getTodayRecord() || records[records.length - 1]

  const [bedTime, setBedTime] = useState(today?.bedTime || '23:00')
  const [wakeTime, setWakeTime] = useState(today?.wakeTime || '07:00')
  const [nightWakeCount, setNightWakeCount] = useState(today?.nightWakeCount || 0)
  const [napDuration, setNapDuration] = useState(today?.napDuration || 0)
  const [coffeeIntake, setCoffeeIntake] = useState(today?.coffeeIntake || 1)
  const [exerciseDuration, setExerciseDuration] = useState(today?.exerciseDuration || 30)

  const recentRecords = useMemo(() => records.slice(-7), [records])
  const factorTips = useMemo(() => getFactorTips(recentRecords), [recentRecords])

  const handleBedTime = () => {
    Taro.showActionSheet({
      itemList: ['21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00'],
      success: (res) => {
        const times = ['21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00']
        setBedTime(times[res.tapIndex])
      }
    })
  }

  const handleWakeTime = () => {
    Taro.showActionSheet({
      itemList: ['05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30'],
      success: (res) => {
        const times = ['05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30']
        setWakeTime(times[res.tapIndex])
      }
    })
  }

  const handleSave = () => {
    addRecord({
      bedTime,
      wakeTime,
      nightWakeCount,
      napDuration,
      coffeeIntake,
      exerciseDuration
    })
    Taro.showToast({ title: '记录已保存', icon: 'success' })
    console.log('[Record] Saved sleep record', { bedTime, wakeTime, nightWakeCount, napDuration, coffeeIntake, exerciseDuration })
  }

  const gotoHabits = () => {
    Taro.navigateTo({ url: '/pages/habits/index' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.greeting}>
        <Text className={styles.greetingText}>晚安，睡眠达人 🌙</Text>
        <Text className={styles.subText}>记录昨晚睡眠，了解你的健康状态</Text>
      </View>

      <View className={styles.section}>
        <SleepScoreCard
          score={today?.score || 75}
          duration={today?.duration || 8}
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

      <Button className={styles.saveBtn} onClick={handleSave}>保存今日记录</Button>
    </View>
  )
}

export default RecordPage
