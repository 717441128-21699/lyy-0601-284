import React, { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import ReminderItem from '@/components/ReminderItem'
import ReminderEditor from '@/components/ReminderEditor'
import { useSleepStore } from '@/store/SleepStore'
import type { Reminder } from '@/types'
import styles from './index.module.scss'

const TYPE_GROUPS: { type: Reminder['type']; title: string; desc: string; icon: string }[] = [
  { type: 'bedtime', title: '🌙 就寝提醒', desc: '提醒你该准备睡觉了', icon: '🌙' },
  { type: 'wakeup', title: '☀️ 起床闹钟', desc: '每天的第一声问候', icon: '☀️' },
  { type: 'screen', title: '📱 屏幕关闭提示', desc: '睡前远离电子设备', icon: '📱' },
  { type: 'abnormal', title: '⚠️ 异常提醒', desc: '连续异常睡眠预警', icon: '⚠️' }
]

const RemindersPage: React.FC = () => {
  const { reminders, toggleReminder, addReminder, updateReminder, deleteReminder } = useSleepStore()
  const [editorVisible, setEditorVisible] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [editingType, setEditingType] = useState<Reminder['type']>('bedtime')

  const groupedReminders = useMemo(() => {
    const map = new Map<Reminder['type'], Reminder[]>()
    TYPE_GROUPS.forEach(g => map.set(g.type, []))
    reminders.forEach(r => {
      const list = map.get(r.type)
      if (list) list.push(r)
    })
    return map
  }, [reminders])

  const handleAdd = (type?: Reminder['type']) => {
    setEditingReminder(null)
    setEditingType(type || 'bedtime')
    setEditorVisible(true)
    console.log('[Reminders] Add new reminder, type:', type || 'bedtime')
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setEditingType(reminder.type)
    setEditorVisible(true)
    console.log('[Reminders] Edit reminder', reminder.id)
  }

  const handleSave = (data: Partial<Reminder>) => {
    if (data.id) {
      const original = reminders.find(r => r.id === data.id)
      updateReminder(data.id, {
        ...data,
        enabled: original?.enabled ?? data.enabled ?? true
      })
      Taro.showToast({ title: '已更新', icon: 'success' })
    } else {
      addReminder({
        ...data,
        type: editingType,
        enabled: true
      })
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

      {TYPE_GROUPS.map(group => {
        const list = groupedReminders.get(group.type) || []
        return (
          <View className={styles.section} key={group.type}>
            <View className={styles.groupHeader}>
              <Text className={styles.sectionTitle}>{group.title}</Text>
              <Button
                className={styles.sectionAction}
                onClick={() => handleAdd(group.type)}
              >
                + 添加
              </Button>
            </View>
            <Text className={styles.groupDesc}>{group.desc}</Text>
            {list.length > 0 ? (
              list.map(reminder => (
                <View
                  key={reminder.id}
                  onClick={(e) => {
                    e.stopPropagation?.()
                    handleEdit(reminder)
                  }}
                >
                  <ReminderItem
                    reminder={reminder}
                    onToggle={(id) => {
                      // 阻止冒泡，只触发开关
                      toggleReminder(id)
                    }}
                  />
                </View>
              ))
            ) : (
              <View className={styles.emptyGroup}>
                <Text className={styles.emptyText}>暂无{group.title.replace(/[^\u4e00-\u9fa5]/g, '')}</Text>
              </View>
            )}
          </View>
        )
      })}

      <ReminderEditor
        visible={editorVisible}
        reminder={editingReminder}
        defaultType={editingType}
        onClose={() => setEditorVisible(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </View>
  )
}

export default RemindersPage
