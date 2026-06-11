import React, { useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useSleepStore } from '@/store/SleepStore'
import { getSleepQuality } from '@/utils'
import styles from './index.module.scss'

const RecordDetailPage: React.FC = () => {
  const router = useRouter()
  const { records } = useSleepStore()
  const date = router.params.date

  const record = useMemo(() => {
    return records.find(r => r.date === date)
  }, [records, date])

  const quality = record ? getSleepQuality(record.score) : null

  const handleEdit = () => {
    Taro.redirectTo({ url: `/pages/index/index?date=${date}` })
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  if (!record) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyTip}>
          <Text style={{ fontSize: '80rpx' }}>🌙</Text>
          <View style={{ marginTop: '24rpx' }}>{date} 暂无睡眠记录</View>
          <Button className={styles.actionBtn} style={{ marginTop: '32rpx' }} onClick={handleEdit}>
            去补录
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.scoreCard}>
        <View className={styles.editBadge}>详情</View>
        <Text className={styles.dateLabel}>{date}</Text>
        <View className={styles.scoreRow}>
          <Text className={styles.scoreValue}>{record.score}</Text>
          <Text className={styles.scoreUnit}>分</Text>
          <Text className={styles.quality} style={{ background: `${quality?.color}40` }}>
            {quality?.text}
          </Text>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.stat}>
            <Text className={styles.statValue}>{record.duration}h</Text>
            <Text className={styles.statLabel}>时长</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.stat}>
            <Text className={styles.statValue}>{record.bedTime}</Text>
            <Text className={styles.statLabel}>入睡</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.stat}>
            <Text className={styles.statValue}>{record.wakeTime}</Text>
            <Text className={styles.statLabel}>起床</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>详细数据</Text>
        <View className={styles.detailCard}>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>
              <Text className={styles.detailIcon}>😴</Text>夜醒次数
            </Text>
            <Text className={styles.detailValue}>{record.nightWakeCount} 次</Text>
          </View>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>
              <Text className={styles.detailIcon}>💤</Text>午睡时长
            </Text>
            <Text className={styles.detailValue}>{record.napDuration} 分钟</Text>
          </View>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>
              <Text className={styles.detailIcon}>☕</Text>咖啡摄入
            </Text>
            <Text className={styles.detailValue}>{record.coffeeIntake} 杯</Text>
          </View>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>
              <Text className={styles.detailIcon}>🏃</Text>运动时长
            </Text>
            <Text className={styles.detailValue}>{record.exerciseDuration} 分钟</Text>
          </View>
        </View>
      </View>

      <View className={styles.actionRow}>
        <Button className={`${styles.actionBtn} ${styles.btnSecondary}`} onClick={handleBack}>返回</Button>
        <Button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={handleEdit}>编辑此记录</Button>
      </View>
    </View>
  )
}

export default RecordDetailPage
