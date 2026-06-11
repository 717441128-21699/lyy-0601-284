import React, { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useSleepStore } from '@/store/SleepStore'
import classnames from 'classnames'
import styles from './index.module.scss'

interface FactorInfo {
  key: string
  name: string
  icon: string
  unit: string
  avgValue: number
  impactScore: number
  impact: 'positive' | 'negative' | 'neutral'
  badDays: { date: string; value: number; score: number }[]
  goodDays: { date: string; value: number; score: number }[]
  threshold: number
  description: string
}

const FactorAnalysisPage: React.FC = () => {
  const { records } = useSleepStore()
  const [mode, setMode] = useState<'week' | 'month'>('week')
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null)

  const displayRecords = useMemo(() => {
    const count = mode === 'week' ? 7 : 30
    return records.slice(-count)
  }, [records, mode])

  const avgScore = useMemo(() => {
    if (displayRecords.length === 0) return 0
    return Math.round(displayRecords.reduce((s, r) => s + r.score, 0) / displayRecords.length)
  }, [displayRecords])

  const factorAnalysis = useMemo((): FactorInfo[] => {
    if (displayRecords.length === 0) return []

    const avgCoffee = displayRecords.reduce((s, r) => s + r.coffeeIntake, 0) / displayRecords.length
    const avgExercise = displayRecords.reduce((s, r) => s + r.exerciseDuration, 0) / displayRecords.length
    const avgWake = displayRecords.reduce((s, r) => s + r.nightWakeCount, 0) / displayRecords.length
    const avgNap = displayRecords.reduce((s, r) => s + r.napDuration, 0) / displayRecords.length

    const coffeeBadDays = displayRecords
      .filter(r => r.coffeeIntake >= 2)
      .sort((a, b) => b.coffeeIntake - a.coffeeIntake)
      .slice(0, 5)
      .map(r => ({ date: r.date, value: r.coffeeIntake, score: r.score }))

    const coffeeGoodDays = displayRecords
      .filter(r => r.coffeeIntake <= 1)
      .sort((a, b) => a.coffeeIntake - b.coffeeIntake)
      .slice(0, 5)
      .map(r => ({ date: r.date, value: r.coffeeIntake, score: r.score }))

    const exerciseBadDays = displayRecords
      .filter(r => r.exerciseDuration < 20)
      .sort((a, b) => a.exerciseDuration - b.exerciseDuration)
      .slice(0, 5)
      .map(r => ({ date: r.date, value: r.exerciseDuration, score: r.score }))

    const exerciseGoodDays = displayRecords
      .filter(r => r.exerciseDuration >= 30)
      .sort((a, b) => b.exerciseDuration - a.exerciseDuration)
      .slice(0, 5)
      .map(r => ({ date: r.date, value: r.exerciseDuration, score: r.score }))

    const wakeBadDays = displayRecords
      .filter(r => r.nightWakeCount >= 2)
      .sort((a, b) => b.nightWakeCount - a.nightWakeCount)
      .slice(0, 5)
      .map(r => ({ date: r.date, value: r.nightWakeCount, score: r.score }))

    const wakeGoodDays = displayRecords
      .filter(r => r.nightWakeCount <= 1)
      .sort((a, b) => a.nightWakeCount - b.nightWakeCount)
      .slice(0, 5)
      .map(r => ({ date: r.date, value: r.nightWakeCount, score: r.score }))

    const napBadDays = displayRecords
      .filter(r => r.napDuration > 60)
      .sort((a, b) => b.napDuration - a.napDuration)
      .slice(0, 5)
      .map(r => ({ date: r.date, value: r.napDuration, score: r.score }))

    const napGoodDays = displayRecords
      .filter(r => r.napDuration <= 30)
      .sort((a, b) => a.napDuration - b.napDuration)
      .slice(0, 5)
      .map(r => ({ date: r.date, value: r.napDuration, score: r.score }))

    const coffeeImpact = avgCoffee > 2 ? -15 : avgCoffee > 1 ? -5 : 5
    const exerciseImpact = avgExercise >= 30 ? 5 : avgExercise < 20 ? -10 : -3
    const wakeImpact = avgWake >= 3 ? -20 : avgWake >= 2 ? -10 : avgWake <= 1 ? 5 : 0
    const napImpact = avgNap > 60 ? -10 : avgNap > 30 ? -5 : 3

    return [
      {
        key: 'coffee',
        name: '咖啡摄入',
        icon: '☕',
        unit: '杯',
        avgValue: Math.round(avgCoffee * 10) / 10,
        impactScore: coffeeImpact,
        impact: coffeeImpact >= 0 ? 'positive' : 'negative',
        badDays: coffeeBadDays,
        goodDays: coffeeGoodDays,
        threshold: 2,
        description: '建议每天不超过2杯，下午3点后避免饮用'
      },
      {
        key: 'exercise',
        name: '运动时长',
        icon: '🏃',
        unit: '分钟',
        avgValue: Math.round(avgExercise),
        impactScore: exerciseImpact,
        impact: exerciseImpact >= 0 ? 'positive' : 'negative',
        badDays: exerciseBadDays,
        goodDays: exerciseGoodDays,
        threshold: 30,
        description: '建议每天保持30分钟以上中等强度运动'
      },
      {
        key: 'nightWake',
        name: '夜醒次数',
        icon: '😴',
        unit: '次',
        avgValue: Math.round(avgWake * 10) / 10,
        impactScore: wakeImpact,
        impact: wakeImpact >= 0 ? 'positive' : 'negative',
        badDays: wakeBadDays,
        goodDays: wakeGoodDays,
        threshold: 1,
        description: '频繁夜醒会严重影响深度睡眠质量'
      },
      {
        key: 'nap',
        name: '午睡时长',
        icon: '💤',
        unit: '分钟',
        avgValue: Math.round(avgNap),
        impactScore: napImpact,
        impact: napImpact >= 0 ? 'positive' : 'negative',
        badDays: napBadDays,
        goodDays: napGoodDays,
        threshold: 30,
        description: '午睡控制在30分钟内最佳，避免影响夜间睡眠'
      }
    ]
  }, [displayRecords])

  const sortedFactors = useMemo(() => {
    return [...factorAnalysis].sort((a, b) => a.impactScore - b.impactScore)
  }, [factorAnalysis])

  const topNegativeFactor = sortedFactors.find(f => f.impact === 'negative')

  const handleBack = () => {
    Taro.navigateBack()
  }

  const toggleFactor = (key: string) => {
    setExpandedFactor(expandedFactor === key ? null : key)
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>睡眠归因分析 🔍</Text>
        <Text className={styles.headerDesc}>找出影响你睡眠的关键因素</Text>
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabsItem, mode === 'week' && styles.tabsItemActive)}
          onClick={() => setMode('week')}
        >
          近7天
        </View>
        <View
          className={classnames(styles.tabsItem, mode === 'month' && styles.tabsItemActive)}
          onClick={() => setMode('month')}
        >
          近30天
        </View>
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>💡 本期总结</Text>
        <Text className={styles.tipText}>
          {displayRecords.length === 0 ? (
            '暂无数据，先记录几天睡眠再来分析吧～'
          ) : topNegativeFactor ? (
            `近${mode === 'week' ? '7' : '30'}天平均评分 ${avgScore} 分，「${topNegativeFactor.name}」是影响你睡眠的最大因素，${topNegativeFactor.description}。`
          ) : (
            `近${mode === 'week' ? '7' : '30'}天平均评分 ${avgScore} 分，各方面表现都不错，继续保持！`
          )}
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>影响因素分析</Text>
        <Text style={{ fontSize: '24rpx', color: '#9A99B8', marginBottom: '16rpx' }}>
          点击卡片查看是哪些天拖低了分数
        </Text>
        <View className={styles.factorList}>
          {sortedFactors.map(factor => (
            <View
              key={factor.key}
              className={classnames(styles.factorCard, expandedFactor === factor.key && styles.factorCardActive)}
              onClick={() => toggleFactor(factor.key)}
            >
              <View className={styles.factorHeader}>
                <View className={styles.factorLeft}>
                  <View className={styles.factorIcon}>
                    <Text>{factor.icon}</Text>
                  </View>
                  <View className={styles.factorInfo}>
                    <Text className={styles.factorName}>{factor.name}</Text>
                    <Text className={styles.factorDesc}>
                      平均 {factor.avgValue} {factor.unit}
                    </Text>
                  </View>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                  <View className={styles.factorImpact}>
                    <Text className={classnames(
                      styles.factorImpactValue,
                      factor.impact === 'positive' ? styles.factorImpactPositive : styles.factorImpactNegative
                    )}>
                      {factor.impactScore >= 0 ? `+${factor.impactScore}` : factor.impactScore} 分
                    </Text>
                    <Text className={styles.factorImpactLabel}>
                      {factor.impact === 'positive' ? '正面影响' : '负面影响'}
                    </Text>
                  </View>
                  <Text className={classnames(
                    styles.factorArrow,
                    expandedFactor === factor.key && styles.factorArrowUp
                  )}>
                    ▾
                  </Text>
                </View>
              </View>

              <View className={classnames(
                styles.factorDetail,
                expandedFactor === factor.key && styles.factorDetailVisible
              )}>
                {factor.badDays.length > 0 && (
                  <>
                    <Text className={styles.factorDetailTitle}>
                      ⚠️ 拖低分数的日子（{factor.badDays.length}天）
                    </Text>
                    <View className={styles.badDayList}>
                      {factor.badDays.map(day => (
                        <View key={day.date} className={styles.badDayItem}>
                          <Text className={styles.badDayItemDate}>{day.date}</Text>
                          <Text className={styles.badDayItemValue}>
                            {factor.key === 'nap' || factor.key === 'exercise'
                              ? `${day.value} ${factor.unit}`
                              : `${day.value} ${factor.unit}`
                            }
                          </Text>
                          <Text className={styles.badDayItemScore}>{day.score}分</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {factor.goodDays.length > 0 && (
                  <>
                    <Text className={styles.factorDetailTitle} style={{ marginTop: '20rpx' }}>
                      ✅ 表现较好的日子（{factor.goodDays.length}天）
                    </Text>
                    <View className={styles.badDayList}>
                      {factor.goodDays.map(day => (
                        <View key={day.date} className={classnames(styles.badDayItem, styles.goodDayItem)}>
                          <Text className={styles.badDayItemDate}>{day.date}</Text>
                          <Text className={styles.badDayItemValue}>
                            {factor.key === 'nap' || factor.key === 'exercise'
                              ? `${day.value} ${factor.unit}`
                              : `${day.value} ${factor.unit}`
                            }
                          </Text>
                          <Text className={styles.badDayItemScore}>{day.score}分</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <Button className={styles.backBtn} onClick={handleBack}>返回</Button>
    </View>
  )
}

export default FactorAnalysisPage
