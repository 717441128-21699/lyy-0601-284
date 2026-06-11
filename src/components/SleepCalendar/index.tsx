import React, { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import type { SleepRecord } from '@/types'
import { getSleepQuality, formatDate } from '@/utils'
import styles from './index.module.scss'

interface SleepCalendarProps {
  records: SleepRecord[]
  selectedDate?: string
  onSelectDate?: (date: string) => void
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

const SleepCalendar: React.FC<SleepCalendarProps> = ({ records, selectedDate, onSelectDate }) => {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selDate, setSelDate] = useState<string>(selectedDate || formatDate(today))

  const recordMap = useMemo(() => {
    const map = new Map<string, SleepRecord>()
    records.forEach(r => map.set(r.date, r))
    return map
  }, [records])

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startWeekday = firstDay.getDay()
    const totalDays = lastDay.getDate()
    const result: { date: string; day: number; isOtherMonth: boolean; isEmpty: boolean }[] = []
    for (let i = 0; i < startWeekday; i++) {
      result.push({ date: '', day: 0, isOtherMonth: false, isEmpty: true })
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(viewYear, viewMonth, d)
      result.push({
        date: formatDate(dateObj),
        day: d,
        isOtherMonth: false,
        isEmpty: false
      })
    }
    while (result.length % 7 !== 0) {
      result.push({ date: '', day: 0, isOtherMonth: false, isEmpty: true })
    }
    return result
  }, [viewYear, viewMonth])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const handleSelect = (date: string) => {
    if (!date) return
    setSelDate(date)
    onSelectDate?.(date)
  }

  const getDayClass = (date: string) => {
    if (!date) return ''
    const record = recordMap.get(date)
    const isToday = date === formatDate(today)
    const isSelected = date === selDate
    let cls = ''
    if (record) {
      const quality = getSleepQuality(record.score)
      if (quality.color === '#52C41A') cls = styles.dayGood
      else if (quality.color === '#FAAD14') cls = styles.dayNormal
      else cls = styles.dayBad
    }
    if (isToday) cls += ` ${styles.dayToday}`
    if (isSelected) cls += ` ${styles.daySelected}`
    return cls
  }

  return (
    <View className={styles.calendar}>
      <View className={styles.header}>
        <Button className={styles.navBtn} onClick={handlePrevMonth}>‹</Button>
        <Text className={styles.title}>{viewYear}年{viewMonth + 1}月</Text>
        <Button className={styles.navBtn} onClick={handleNextMonth}>›</Button>
      </View>

      <View className={styles.weekRow}>
        {WEEK_DAYS.map(w => (
          <Text className={styles.weekCell} key={w}>{w}</Text>
        ))}
      </View>

      <View className={styles.daysGrid}>
        {days.map((d, idx) => (
          <View
            key={idx}
            className={classnames(
              styles.dayCell,
              d.isEmpty && styles.dayEmpty,
              getDayClass(d.date)
            )}
            onClick={() => handleSelect(d.date)}
          >
            {!d.isEmpty && (
              <View className={styles.dayInner}>
                <Text className={styles.dayNumber}>{d.day}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ background: 'rgba(82, 196, 26, 0.5)' }} />
          <Text className={styles.legendText}>优质(≥80)</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ background: 'rgba(250, 173, 20, 0.5)' }} />
          <Text className={styles.legendText}>良好(≥60)</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ background: 'rgba(255, 77, 79, 0.5)' }} />
          <Text className={styles.legendText}>较差(&lt;60)</Text>
        </View>
      </View>
    </View>
  )
}

export default SleepCalendar
