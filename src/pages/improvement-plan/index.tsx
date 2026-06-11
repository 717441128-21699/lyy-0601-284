import React, { useMemo, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useSleepStore } from '@/store/SleepStore'
import classnames from 'classnames'
import styles from './index.module.scss'

const ImprovementPlanPage: React.FC = () => {
  const { improvementPlan, generateImprovementPlan, toggleDailyGoal, resetImprovementPlan } = useSleepStore()

  useEffect(() => {
    if (!improvementPlan) {
      generateImprovementPlan()
    }
  }, [])

  const completedCount = useMemo(() => {
    if (!improvementPlan) return 0
    return improvementPlan.goals.filter(g => g.completed).length
  }, [improvementPlan])

  const totalGoals = improvementPlan?.goals.length || 0
  const progress = totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0

  const handleGenerate = () => {
    Taro.showModal({
      title: '生成新计划',
      content: '确定要根据最近的睡眠数据生成新的7天改善计划吗？当前进度将被重置。',
      success: (res) => {
        if (res.confirm) {
          generateImprovementPlan()
          Taro.showToast({ title: '计划已生成', icon: 'success' })
        }
      }
    })
  }

  const handleReset = () => {
    Taro.showModal({
      title: '重置计划',
      content: '确定要重置当前改善计划吗？',
      success: (res) => {
        if (res.confirm) {
          resetImprovementPlan()
        }
      }
    })
  }

  const handleToggle = (goalId: string) => {
    toggleDailyGoal(goalId)
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const gotoHabits = () => {
    Taro.switchTab({ url: '/pages/habits/index' })
  }

  if (!improvementPlan) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.headerTitle}>7天改善计划 🌟</Text>
          <Text className={styles.headerDesc}>科学规划，逐步改善睡眠质量</Text>
        </View>

        <View className={styles.emptyState}>
          <View className={styles.emptyStateIcon}>🌙</View>
          <Text className={styles.emptyStateTitle}>还没有改善计划</Text>
          <Text className={styles.emptyStateDesc}>
            根据你最近的睡眠数据，{'\n'}
            为你量身定制7天改善小目标
          </Text>
          <Button className={styles.generateBtn} onClick={handleGenerate}>
            生成我的改善计划
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>7天改善计划 🌟</Text>
        <Text className={styles.headerDesc}>开始于 {improvementPlan.startDate}</Text>
      </View>

      <View className={styles.progressCard}>
        <View className={styles.progressCardHeader}>
          <Text className={styles.progressCardTitle}>完成进度</Text>
          <Text className={styles.progressCardDays}>
            {completedCount} / {totalGoals} 个目标
          </Text>
        </View>
        <View className={styles.progressCardProgressBar}>
          <View
            className={styles.progressCardProgressFill}
            style={{ width: `${progress}%` }}
          />
        </View>
        <View className={styles.progressCardStats}>
          <Text>坚持就是胜利！</Text>
          <Text>{progress}%</Text>
        </View>
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>💡 小贴士</Text>
        <Text className={styles.tipText}>
          每天完成目标后记得打卡哦！打卡记录会同步到习惯计划中，帮你更好地追踪长期坚持情况。
        </Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>我的目标</Text>
          <Button className={styles.sectionAction} onClick={gotoHabits}>
            查看习惯
          </Button>
        </View>

        <View className={styles.goalList}>
          {improvementPlan.goals.map(goal => (
            <View
              key={goal.id}
              className={classnames(styles.goalCard, goal.completed && styles.goalCardCompleted)}
              onClick={() => handleToggle(goal.id)}
            >
              <View className={styles.goalCardDay}>
                <Text className={styles.goalCardDayNum}>{goal.day}</Text>
                <Text className={styles.goalCardDayText}>第{goal.day}天</Text>
              </View>
              <View className={styles.goalCardContent}>
                <Text className={styles.goalCardTitle}>{goal.title}</Text>
                <Text className={styles.goalCardDesc}>{goal.description}</Text>
              </View>
              <View className={classnames(
                styles.goalCardCheck,
                goal.completed && styles.goalCardChecked
              )} />
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomActions}>
        <Button
          className={classnames(styles.actionBtn, styles.actionBtnSecondary)}
          onClick={handleReset}
        >
          重置计划
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
          onClick={handleGenerate}
        >
          重新生成
        </Button>
      </View>
    </View>
  )
}

export default ImprovementPlanPage
