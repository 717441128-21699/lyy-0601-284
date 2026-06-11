import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import type { Reminder } from '@/types'
import styles from './index.module.scss'

interface ReminderEditorProps {
  visible: boolean
  reminder?: Reminder | null
  onClose: () => void
  onSave: (reminder: Partial<Reminder>) => void
  onDelete?: (id: string) => void
}

const TYPES: { type: Reminder['type']; name: string; icon: string }[] = [
  { type: 'bedtime', name: '就寝提醒', icon: '🌙' },
  { type: 'wakeup', name: '起床闹钟', icon: '☀️' },
  { type: 'screen', name: '屏幕提示', icon: '📱' },
  { type: 'abnormal', name: '异常提醒', icon: '⚠️' }
]

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const ReminderEditor: React.FC<ReminderEditorProps> = ({ visible, reminder, onClose, onSave, onDelete }) => {
  const [type, setType] = useState<Reminder['type']>('bedtime')
  const [time, setTime] = useState('22:30')
  const [repeat, setRepeat] = useState<string[]>(['每天'])

  useEffect(() => {
    if (reminder) {
      setType(reminder.type)
      setTime(reminder.time)
      setRepeat([...reminder.repeat])
    } else {
      setType('bedtime')
      setTime('22:30')
      setRepeat(['每天'])
    }
  }, [reminder, visible])

  if (!visible) return null

  const handleTypeChange = (t: Reminder['type']) => {
    setType(t)
    const typeInfo = TYPES.find(item => item.type === t)
    if (t === 'bedtime') setTime('22:30')
    else if (t === 'wakeup') setTime('07:00')
    else if (t === 'screen') setTime('21:30')
    else if (t === 'abnormal') setTime('08:00')
    console.log('[ReminderEditor] Type changed to', t)
  }

  const handleTimeChange = () => {
    const hours: string[] = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        hours.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      }
    }
    Taro.showActionSheet({
      itemList: hours,
      success: (res) => {
        setTime(hours[res.tapIndex])
        console.log('[ReminderEditor] Time set to', hours[res.tapIndex])
      }
    })
  }

  const toggleRepeat = (day: string) => {
    setRepeat(prev => {
      if (prev.includes('每天')) {
        return [day]
      }
      if (prev.includes(day)) {
        const newRepeat = prev.filter(d => d !== day)
        if (newRepeat.length === 0) return ['每天']
        return newRepeat
      }
      const newRepeat = [...prev, day].filter(d => d !== '每天')
      if (newRepeat.length === 7) return ['每天']
      return newRepeat
    })
  }

  const handleSave = () => {
    const typeInfo = TYPES.find(t => t.type === type)
    onSave({
      id: reminder?.id,
      type,
      title: typeInfo?.name || '提醒',
      time,
      repeat,
      enabled: true
    })
    console.log('[ReminderEditor] Saved reminder', { type, time, repeat })
    onClose()
  }

  const handleDelete = () => {
    Taro.showModal({
      title: '删除提醒',
      content: '确定要删除这个提醒吗？',
      success: (res) => {
        if (res.confirm && reminder?.id) {
          onDelete?.(reminder.id)
          onClose()
        }
      }
    })
  }

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.modal} onClick={e => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.title}>{reminder ? '编辑提醒' : '新建提醒'}</Text>
          <Button className={styles.closeBtn} onClick={onClose}>×</Button>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionLabel}>提醒类型</Text>
          <View className={styles.typeRow}>
            {TYPES.map(t => (
              <View
                key={t.type}
                className={classnames(styles.typeItem, type === t.type && styles.typeItemActive)}
                onClick={() => handleTypeChange(t.type)}
              >
                <View className={styles.typeIcon}>{t.icon}</View>
                <Text className={styles.typeName}>{t.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionLabel}>提醒时间</Text>
          <View className={styles.timeRow}>
            <View className={styles.timeDisplay} onClick={handleTimeChange}>
              <Text className={styles.timeValue}>{time}</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionLabel}>重复</Text>
          <View className={styles.repeatGrid}>
            <View
              className={classnames(styles.repeatItem, repeat.includes('每天') && styles.repeatItemActive)}
              onClick={() => setRepeat(['每天'])}
            >
              每天
            </View>
            {WEEK_DAYS.map(day => (
              <View
                key={day}
                className={classnames(styles.repeatItem, repeat.includes(day) && styles.repeatItemActive)}
                onClick={() => toggleRepeat(day)}
              >
                {day}
              </View>
            ))}
          </View>
        </View>

        {reminder && (
          <View className={styles.dangerZone}>
            <Button className={styles.deleteBtn} onClick={handleDelete}>删除此提醒</Button>
          </View>
        )}

        <Button className={styles.saveBtn} onClick={handleSave}>保存</Button>
      </View>
    </View>
  )
}

export default ReminderEditor
