import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import type { RelaxItem } from '@/types'
import styles from './index.module.scss'

interface RelaxCardProps {
  item: RelaxItem
  onClick?: () => void
}

const iconMap: Record<RelaxItem['type'], string> = {
  breathing: '🌬️',
  whitenoise: '🎵',
  checklist: '📋'
}

const tagMap: Record<RelaxItem['type'], { text: string; cls: string }> = {
  breathing: { text: '呼吸训练', cls: styles.tagBreathing },
  whitenoise: { text: '白噪音', cls: styles.tagNoise },
  checklist: { text: '清单', cls: styles.tagChecklist }
}

const iconClassMap: Record<RelaxItem['type'], string> = {
  breathing: styles.iconBreathing,
  whitenoise: styles.iconNoise,
  checklist: styles.iconChecklist
}

const RelaxCard: React.FC<RelaxCardProps> = ({ item, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={classnames(styles.icon, iconClassMap[item.type])}>
          <Text>{iconMap[item.type]}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.title}>{item.title}</Text>
          <Text className={classnames(styles.tag, tagMap[item.type].cls)}>{tagMap[item.type].text}</Text>
        </View>
      </View>
      <Text className={styles.desc}>{item.description}</Text>
      {item.duration && (
        <View className={styles.duration}>
          <Text className={styles.durationIcon}>⏱️</Text>
          <Text className={styles.durationText}>约 {item.duration} 分钟</Text>
        </View>
      )}
    </View>
  )
}

export default RelaxCard
