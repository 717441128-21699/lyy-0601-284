import React, { useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import TrendChart from '@/components/TrendChart'
import { useSleepStore } from '@/store/SleepStore'
import { getFactorTips } from '@/utils'
import styles from './index.module.scss'

const TrendsPage: React.FC = () => {
  const { records } = useSleepStore()

  const weekData = useMemo(() => {
    const last7 = records.slice(-7)
    return last7.map(r => ({
      date: r.date,
      value: r.score,
      label: r.date.slice(5).replace('-', '/')
    }))
  }, [records])

  const durationData = useMemo(() => {
    const last7 = records.slice(-7)
    return last7.map(r => ({
      date: r.date,
      value: Math.min(12, r.duration),
      label: r.date.slice(5).replace('-', '/')
    }))
  }, [records])

  const summary = useMemo(() => {
    const last7 = records.slice(-7)
    const avgScore = Math.round(last7.reduce((s, r) => s + r.score, 0) / last7.length)
    const avgDuration = (last7.reduce((s, r) => s + r.duration, 0) / last7.length).toFixed(1)
    const avgWake = Math.round(last7.reduce((s, r) => s + r.nightWakeCount, 0) / last7.length * 10) / 10
    const avgCoffee = Math.round(last7.reduce((s, r) => s + r.coffeeIntake, 0) / last7.length * 10) / 10
    const avgExercise = Math.round(last7.reduce((s, r) => s + r.exerciseDuration, 0) / last7.length)
    return { avgScore, avgDuration, avgWake, avgCoffee, avgExercise }
  }, [records])

  const factorTips = useMemo(() => getFactorTips(records.slice(-14)), [records])

  const gotoReport = () => {
    Taro.navigateTo({ url: '/pages/report/index' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{summary.avgScore}</Text>
          <Text className={styles.statUnit}> 分</Text>
          <Text className={styles.statLabel}>周平均评分</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{summary.avgDuration}</Text>
          <Text className={styles.statUnit}> 小时</Text>
          <Text className={styles.statLabel}>周平均时长</Text>
        </View>
      </View>

      <View className={styles.section}>
        <TrendChart data={weekData} title="睡眠评分趋势" maxValue={100} unit="分" />
      </View>

      <View className={styles.section}>
        <TrendChart data={durationData} title="睡眠时长趋势" maxValue={12} unit="h" />
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>本周数据统计</Text>
          <Button className={styles.sectionAction} onClick={gotoReport}>生成报告</Button>
        </View>
        <View className={styles.summaryCard}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>平均评分</Text>
            <Text className={`${styles.summaryValue} ${summary.avgScore >= 70 ? styles.summaryValueGood : styles.summaryValueBad}`}>
              {summary.avgScore} 分
            </Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>平均睡眠时长</Text>
            <Text className={`${styles.summaryValue} ${summary.avgDuration >= 7 ? styles.summaryValueGood : ''}`}>
              {summary.avgDuration} 小时
            </Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>平均夜醒次数</Text>
            <Text className={styles.summaryValue}>{summary.avgWake} 次</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>日均咖啡摄入</Text>
            <Text className={styles.summaryValue}>{summary.avgCoffee} 杯</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>日均运动时长</Text>
            <Text className={styles.summaryValue}>{summary.avgExercise} 分钟</Text>
          </View>
        </View>
      </View>

      {factorTips.length > 0 && (
        <View className={styles.tipsSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>改善建议</Text>
          </View>
          {factorTips.map((tip, idx) => (
            <View
              key={idx}
              className={`${styles.tipCard} ${tip.impact === 'positive' ? styles.tipCardPositive : ''}`}
            >
              <View className={styles.tipHeader}>
                <Text className={styles.tipIcon}>{tip.impact === 'positive' ? '✅' : '💡'}</Text>
                <Text className={styles.tipTitle}>{tip.factor}</Text>
              </View>
              <Text className={styles.tipContent}>{tip.message}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default TrendsPage
