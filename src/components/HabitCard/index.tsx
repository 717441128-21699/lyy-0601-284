import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import type { Habit } from '@/types'
import styles from './index.module.scss'

interface HabitCardProps {
  habit: Habit
  onToggle?: (id: string) => void
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle }) => {
  const percent = Math.min(100, Math.round((habit.completedDays / habit.targetDays) * 100))

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.icon}>
          <Text>{habit.icon}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{habit.name}</Text>
          <Text className={styles.description}>{habit.description}</Text>
        </View>
      </View>
      <View className={styles.progressWrap}>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${percent}%` }} />
        </View>
        <View className={styles.progressText}>
          <Text className={styles.progressDays}>已坚持 {habit.completedDays}/{habit.targetDays} 天</Text>
          <Text className={styles.progressPercent}>{percent}%</Text>
        </View>
      </View>
      <View className={styles.footer}>
        <Text className={classnames(styles.status, habit.isActive && styles.statusActive)}>
          {habit.isActive ? '今日已打卡' : '今日待完成'}
        </Text>
        <Button
          className={classnames(styles.checkBtn, habit.isActive && styles.checkBtnActive)}
          onClick={() => onToggle?.(habit.id)}
        >
          {habit.isActive ? '✓ 已完成' : '去打卡'}
        </Button>
      </View>
    </View>
  )
}

export default HabitCard
