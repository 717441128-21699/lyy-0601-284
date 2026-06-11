import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import ReminderItem from '@/components/ReminderItem'
import ReminderEditor from '@/components/ReminderEditor'
import { useSleepStore } from '@/store/SleepStore'
import type { Reminder } from '@/types'
import styles from './index.module.scss'

const RemindersPage: React.FC = () => {
  const { reminders, toggleReminder, addReminder, updateReminder, deleteReminder } = useSleepStore()
  const [editorVisible, setEditorVisible] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const handleAdd = () => {
    setEditingReminder(null)
    setEditorVisible(true)
    console.log('[Reminders] Add new reminder')
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setEditorVisible(true)
    console.log('[Reminders] Edit reminder', reminder.id)
  }

  const handleSave = (data: Partial<Reminder>) => {
    if (data.id) {
      updateReminder(data.id, data)
      Taro.showToast({ title: '已更新', icon: 'success' })
    } else {
      addReminder(data)
      Taro.showToast({ title: '已添加', icon: 'success' })
    }
  }

  const handleDelete = (id: string) => {
    deleteReminder(id)
    Taro.showToast({ title: '已删除', icon: 'success' })
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
          <View key={reminder.id} onClick={() => handleEdit(reminder)}>
            <ReminderItem reminder={reminder} onToggle={toggleReminder} />
          </View>
        ))}
        <Button className={styles.addBtn} onClick={handleAdd}>+ 添加新提醒</Button>
      </View>

      <ReminderEditor
        visible={editorVisible}
        reminder={editingReminder}
        onClose={() => setEditorVisible(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </View>
  )
}

export default RemindersPage
