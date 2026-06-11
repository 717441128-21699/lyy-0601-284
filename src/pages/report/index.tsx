import React, { useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useSleepStore } from '@/store/SleepStore'
import { getSleepQuality, getFactorTips } from '@/utils'
import classnames from 'classnames'
import styles from './index.module.scss'

const ReportPage: React.FC = () => {
  const { records, profile } = useSleepStore()

  const reportData = useMemo(() => {
    const last30 = records.slice(-30)
    const last7 = records.slice(-7)
    const avg30Score = Math.round(last30.reduce((s, r) => s + r.score, 0) / last30.length)
    const avg7Score = Math.round(last7.reduce((s, r) => s + r.score, 0) / last7.length)
    const avgDuration = (last30.reduce((s, r) => s + r.duration, 0) / last30.length).toFixed(1)
    const avgWake = (last30.reduce((s, r) => s + r.nightWakeCount, 0) / last30.length).toFixed(1)
    const avgCoffee = (last30.reduce((s, r) => s + r.coffeeIntake, 0) / last30.length).toFixed(1)
    const avgExercise = Math.round(last30.reduce((s, r) => s + r.exerciseDuration, 0) / last30.length)
    const bestDay = last30.reduce((best, r) => r.score > best.score ? r : best, last30[0])
    const worstDay = last30.reduce((worst, r) => r.score < worst.score ? r : worst, last30[0])
    return { avg30Score, avg7Score, avgDuration, avgWake, avgCoffee, avgExercise, bestDay, worstDay }
  }, [records])

  const factorTips = useMemo(() => getFactorTips(records.slice(-30)), [records])

  const handleShare = () => {
    Taro.showActionSheet({
      itemList: ['分享给微信好友', '分享给医生', '生成图片保存', '复制链接'],
      success: (res) => {
        const actions = ['微信好友', '医生', '保存图片', '复制链接']
        Taro.showToast({ title: `已${actions[res.tapIndex]}`, icon: 'success' })
        console.log('[Report] Share via', actions[res.tapIndex])
      }
    })
  }

  const handleExport = () => {
    Taro.showToast({ title: '报告已导出', icon: 'success' })
    console.log('[Report] Export report')
  }

  const quality = getSleepQuality(reportData.avg30Score)
  const scoreTrend = reportData.avg7Score - reportData.avg30Score

  return (
    <View className={styles.page}>
      <View className={styles.heroCard}>
        <Text className={styles.heroTitle}>近30天睡眠报告</Text>
        <View className={styles.heroScoreRow}>
          <Text className={styles.heroScore}>{reportData.avg30Score}</Text>
          <Text className={styles.heroUnit}>分</Text>
          <Text className={styles.heroQuality} style={{ background: `${quality.color}40` }}>
            {quality.text}
          </Text>
        </View>
        <Text className={styles.heroDesc}>
          你好，{profile.name}！过去一个月你的睡眠{quality.text}，
          {scoreTrend >= 0 ? `近一周表现优于平均水平 ${scoreTrend}分，继续保持！` : `近一周略有下降，需要注意调整作息。`}
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>数据概览</Text>
        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>⏱️</Text>平均睡眠时长
            </Text>
            <Text className={`${styles.summaryValue} ${Number(reportData.avgDuration) >= 7 ? styles.summaryValueGood : styles.summaryValueWarn}`}>
              {reportData.avgDuration} 小时
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>😴</Text>平均夜醒次数
            </Text>
            <Text className={`${styles.summaryValue} ${Number(reportData.avgWake) <= 1 ? styles.summaryValueGood : styles.summaryValueBad}`}>
              {reportData.avgWake} 次
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>☕</Text>日均咖啡摄入
            </Text>
            <Text className={`${styles.summaryValue} ${Number(reportData.avgCoffee) <= 2 ? styles.summaryValueGood : styles.summaryValueWarn}`}>
              {reportData.avgCoffee} 杯
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>🏃</Text>日均运动时长
            </Text>
            <Text className={`${styles.summaryValue} ${reportData.avgExercise >= 30 ? styles.summaryValueGood : ''}`}>
              {reportData.avgExercise} 分钟
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>🏆</Text>睡眠最佳日期
            </Text>
            <Text className={styles.summaryValue}>{reportData.bestDay?.date}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>📉</Text>睡眠较差日期
            </Text>
            <Text className={styles.summaryValue}>{reportData.worstDay?.date}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>改善建议</Text>
        {factorTips.length > 0 ? factorTips.map((tip, idx) => (
          <View key={idx} className={styles.adviceCard}>
            <View className={styles.adviceHeader}>
              <View className={styles.adviceIcon} style={{
                background: tip.impact === 'positive'
                  ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.15)'
                  : 'linear-gradient(135deg, rgba(255, 184, 112, 0.15)'
              }}>
                <Text>{tip.impact === 'positive' ? '✓' : '💡'}</Text>
              </View>
              <View className={styles.adviceContent}>
                <Text className={styles.adviceTitle}>{tip.factor}</Text>
                <Text className={styles.adviceText}>{tip.message}</Text>
              </View>
            </View>
          </View>
        )) : (
          <View className={styles.adviceCard}>
            <View className={styles.adviceHeader}>
              <View className={styles.adviceIcon}>
                <Text>✨</Text>
              </View>
              <View className={styles.adviceContent}>
                <Text className={styles.adviceTitle}>继续保持</Text>
                <Text className={styles.adviceText}>你的睡眠状态良好，请继续保持规律作息和健康生活习惯。</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className={styles.shareSection}>
        <View className={styles.shareRow}>
          <Button className={`${styles.shareBtn} ${styles.btnSecondary}`} onClick={handleExport}>导出PDF</Button>
          <Button className={`${styles.shareBtn} ${styles.btnPrimary}`} onClick={handleShare}>分享报告</Button>
        </View>
        <Text className={styles.infoFooter}>报告生成于 {new Date().toLocaleDateString()}</Text>
      </View>
    </View>
  )
}

export default ReportPage
