import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import type { Reminder } from '@/types'
import styles from './index.module.scss'

interface ReminderItemProps {
  reminder: Reminder
  onToggle?: (id: string) => void
}

const iconMap: Record<Reminder['type'], string> = {
  bedtime: '🌙',
  wakeup: '☀️',
  screen: '📱',
  abnormal: '⚠️'
}

const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onToggle }) => {
  const iconClass = {
    bedtime: styles.iconBedtime,
    wakeup: styles.iconWakeup,
    screen: styles.iconScreen,
    abnormal: styles.iconAbnormal
  }[reminder.type]

  return (
    <View className={styles.item}>
      <View className={styles.row}>
        <View className={styles.left}>
          <View className={classnames(styles.icon, iconClass)}>
            <Text>{iconMap[reminder.type]}</Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.title}>{reminder.title}</Text>
            <View className={styles.meta}>
              <Text className={styles.time}>{reminder.time}</Text>
              <Text className={styles.repeat}>{reminder.repeat.join('、')}</Text>
            </View>
          </View>
        </View>
        <View
          className={classnames(styles.switch, reminder.enabled && styles.switchOn)}
          onClick={() => onToggle?.(reminder.id)}
        >
          <View className={styles.switchHandle} />
        </View>
      </View>
    </View>
  )
}

export default ReminderItem
