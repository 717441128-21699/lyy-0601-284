import React from 'react'
import { View, Text } from '@tarojs/components'
import { getSleepQuality } from '@/utils'
import styles from './index.module.scss'

interface SleepScoreCardProps {
  score: number
  duration: number
  bedTime: string
  wakeTime: string
}

const SleepScoreCard: React.FC<SleepScoreCardProps> = ({ score, duration, bedTime, wakeTime }) => {
  const quality = getSleepQuality(score)
  const rotation = (score / 100) * 360 - 45

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.title}>昨晚睡眠评分</Text>
        <View className={styles.quality} style={{ background: `${quality.color}33` }}>
          <Text>{quality.text}</Text>
        </View>
      </View>
      <View className={styles.scoreSection}>
        <View className={styles.scoreMain}>
          <Text className={styles.scoreValue}>{score}</Text>
          <Text className={styles.scoreUnit}>分</Text>
        </View>
        <View
          className={styles.scoreCircle}
          style={{ transform: `rotate(${rotation}deg)`, borderTopColor: quality.color }}
        />
      </View>
      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{duration}h</Text>
          <Text className={styles.statLabel}>睡眠时长</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{bedTime}</Text>
          <Text className={styles.statLabel}>入睡时间</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{wakeTime}</Text>
          <Text className={styles.statLabel}>起床时间</Text>
        </View>
      </View>
    </View>
  )
}

export default SleepScoreCard
