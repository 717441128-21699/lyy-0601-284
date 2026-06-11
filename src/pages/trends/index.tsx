import React, { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import TrendChart from '@/components/TrendChart'
import SleepCalendar from '@/components/SleepCalendar'
import { useSleepStore } from '@/store/SleepStore'
import { getFactorTips } from '@/utils'
import styles from './index.module.scss'

const TrendsPage: React.FC = () => {
  const { records } = useSleepStore()
  const [mode, setMode] = useState<'week' | 'month'>('week')
  const [showCalendar, setShowCalendar] = useState(false)

  const displayData = useMemo(() => {
    const count = mode === 'week' ? 7 : 30
    const data = records.slice(-count)
    return data.map(r => ({
      date: r.date,
      value: r.score,
      label: r.date.slice(5).replace('-', '/')
    }))
  }, [records, mode])

  const durationData = useMemo(() => {
    const count = mode === 'week' ? 7 : 30
    const data = records.slice(-count)
    return data.map(r => ({
      date: r.date,
      value: Math.min(12, r.duration),
      label: r.date.slice(5).replace('-', '/')
    }))
  }, [records, mode])

  const summary = useMemo(() => {
    const count = mode === 'week' ? 7 : 30
    const data = records.slice(-count)
    if (data.length === 0) {
      return { avgScore: 0, avgDuration: '0', avgWake: '0', avgCoffee: '0', avgExercise: 0 }
    }
    const avgScore = Math.round(data.reduce((s, r) => s + r.score, 0) / data.length)
    const avgDuration = (data.reduce((s, r) => s + r.duration, 0) / data.length).toFixed(1)
    const avgWake = (data.reduce((s, r) => s + r.nightWakeCount, 0) / data.length).toFixed(1)
    const avgCoffee = (data.reduce((s, r) => s + r.coffeeIntake, 0) / data.length).toFixed(1)
    const avgExercise = Math.round(data.reduce((s, r) => s + r.exerciseDuration, 0) / data.length)
    return { avgScore, avgDuration, avgWake, avgCoffee, avgExercise }
  }, [records, mode])

  const factorTips = useMemo(() => {
    const count = mode === 'week' ? 7 : 30
    return getFactorTips(records.slice(-count))
  }, [records, mode])

  const handleSelectDate = (date: string) => {
    Taro.navigateTo({ url: `/pages/record-detail/index?date=${date}` })
  }

  const gotoReport = () => {
    Taro.navigateTo({ url: '/pages/report/index' })
  }

  const gotoFactorAnalysis = () => {
    Taro.navigateTo({ url: '/pages/factor-analysis/index' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{summary.avgScore}</Text>
          <Text className={styles.statUnit}> 分</Text>
          <Text className={styles.statLabel}>{mode === 'week' ? '周' : '月'}平均评分</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{summary.avgDuration}</Text>
          <Text className={styles.statUnit}> 小时</Text>
          <Text className={styles.statLabel}>{mode === 'week' ? '周' : '月'}平均时长</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>睡眠日历</Text>
          <Button
            className={styles.sectionAction}
            onClick={() => setShowCalendar(v => !v)}
          >
            {showCalendar ? '收起' : '展开'}
          </Button>
        </View>
        {showCalendar && (
          <SleepCalendar
            records={records}
            onSelectDate={handleSelectDate}
          />
        )}
      </View>

      <View className={styles.section}>
        <TrendChart
          data={displayData}
          title="睡眠评分趋势"
          maxValue={100}
          unit="分"
          mode={mode}
          onModeChange={setMode}
        />
      </View>

      <View className={styles.section}>
        <TrendChart
          data={durationData}
          title="睡眠时长趋势"
          maxValue={12}
          unit="h"
          hideTabs
        />
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>{mode === 'week' ? '本周' : '本月'}数据统计</Text>
          <View style={{ display: 'flex', gap: '12rpx' }}>
            <Button className={styles.sectionAction} onClick={gotoFactorAnalysis}>归因分析</Button>
            <Button className={styles.sectionAction} onClick={gotoReport}>生成报告</Button>
          </View>
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
            <Text className={`${styles.summaryValue} ${Number(summary.avgDuration) >= 7 ? styles.summaryValueGood : ''}`}>
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
