import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import ReminderItem from '@/components/ReminderItem'
import { useSleepStore } from '@/store/SleepStore'
import styles from './index.module.scss'

const RemindersPage: React.FC = () => {
  const { reminders, toggleReminder } = useSleepStore()

  const handleAdd = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' })
    console.log('[Reminders] Add new reminder clicked')
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>提醒中心 ⏰</Text>
        <Text className={styles.desc}>科学设置提醒，培养规律作息习惯</Text>
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>
          <Text className={styles.tipIcon}>💡</Text>
          睡眠小贴士
        </Text>
        <Text className={styles.tipContent}>
          建议睡前1小时关闭电子屏幕，保持卧室温度在20-22°C，有助于更快进入深度睡眠。
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我的提醒</Text>
        {reminders.map(reminder => (
          <ReminderItem
            key={reminder.id}
            reminder={reminder}
            onToggle={toggleReminder}
          />
        ))}
        <Button className={styles.addBtn} onClick={handleAdd}>+ 添加新提醒</Button>
      </View>
    </View>
  )
}

export default RemindersPage
