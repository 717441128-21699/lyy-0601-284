import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import HabitCard from '@/components/HabitCard'
import { useSleepStore } from '@/store/SleepStore'
import classnames from 'classnames'
import styles from './index.module.scss'

const HabitsPage: React.FC = () => {
  const { habits, toggleHabit, addHabit } = useSleepStore()
  const [tab, setTab] = useState<'active' | 'all'>('active')

  const activeHabits = habits.filter(h => h.isActive)
  const displayHabits = tab === 'active' ? activeHabits : habits

  const handleAdd = () => {
    Taro.showActionSheet({
      itemList: ['睡前远离电子设备', '固定时间睡觉', '睡前冥想放松', '避免午后咖啡', '卧室保持黑暗'],
      success: (res) => {
        const presets = [
          { name: '睡前远离电子设备', desc: '睡前1小时不看电子屏幕', icon: '📵', target: 21 },
          { name: '固定时间睡觉', desc: '每天同一时间上床睡觉', icon: '⏰', target: 30 },
          { name: '睡前冥想放松', desc: '睡前10分钟冥想', icon: '🧘', target: 14 },
          { name: '避免午后咖啡', desc: '下午3点后不喝咖啡', icon: '☕', target: 21 },
          { name: '卧室保持黑暗', desc: '睡前关闭所有光源', icon: '🌙', target: 14 }
        ]
        const preset = presets[res.tapIndex]
        addHabit({
          name: preset.name,
          description: preset.desc,
          icon: preset.icon,
          targetDays: preset.target
        })
        Taro.showToast({ title: '已添加', icon: 'success' })
        console.log('[Habits] Added new habit', preset.name)
      }
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>习惯计划 ✨</Text>
        <Text className={styles.desc}>养成良好睡眠习惯，提升睡眠质量</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.stat}>
          <Text className={styles.statNum}>{activeHabits.length}</Text>
          <Text className={styles.statLabel}>进行中</Text>
        </View>
        <View className={styles.stat}>
          <Text className={styles.statNum}>{habits.length}</Text>
          <Text className={styles.statLabel}>全部习惯</Text>
        </View>
        <View className={styles.stat}>
          <Text className={styles.statNum}>
            {habits.reduce((s, h) => s + h.completedDays, 0)}
          </Text>
          <Text className={styles.statLabel}>累计打卡</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, tab === 'active' && styles.tabActive)}
          onClick={() => setTab('active')}
        >
          进行中
        </View>
        <View
          className={classnames(styles.tab, tab === 'all' && styles.tabActive)}
          onClick={() => setTab('all')}
        >
          全部
        </View>
      </View>

      {displayHabits.length > 0 ? (
        displayHabits.map(habit => (
          <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
        ))
      ) : (
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>🌱</Text>
          <Text className={styles.emptyText}>还没有习惯，添加一个吧</Text>
        </View>
      )}

      <Button className={styles.addBtn} onClick={handleAdd}>+ 添加新习惯</Button>
    </View>
  )
}

export default HabitsPage
