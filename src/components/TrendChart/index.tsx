import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import styles from './index.module.scss'

interface TrendChartProps {
  data: { date: string; value: number; label: string }[]
  title?: string
  maxValue?: number
  unit?: string
}

const TrendChart: React.FC<TrendChartProps> = ({ data, title = '睡眠趋势', maxValue = 100, unit = '分' }) => {
  const [mode, setMode] = useState<'week' | 'month'>('week')
  const avgValue = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.value, 0) / data.length) : 0
  const avgPosition = 100 - (avgValue / maxValue) * 100

  return (
    <View className={styles.chart}>
      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        <View className={styles.tabs}>
          <Button
            className={`${styles.tab} ${mode === 'week' ? styles.tabActive : ''}`}
            onClick={() => setMode('week')}
          >
            周
          </Button>
          <Button
            className={`${styles.tab} ${mode === 'month' ? styles.tabActive : ''}`}
            onClick={() => setMode('month')}
          >
            月
          </Button>
        </View>
      </View>
      <View className={styles.chartBody}>
        <View className={styles.bars}>
          {data.map((item, idx) => (
            <View className={styles.barGroup} key={idx}>
              <View
                className={styles.bar}
                style={{ height: `${(item.value / maxValue) * 240}rpx` }}
              />
            </View>
          ))}
        </View>
        <View className={styles.avgLine} style={{ bottom: `${avgPosition}%` }}>
          <Text className={styles.avgLabel}>平均 {avgValue}{unit}</Text>
        </View>
      </View>
      <View className={styles.xAxis}>
        {data.map((item, idx) => (
          <Text className={styles.barLabel} key={idx}>{item.label}</Text>
        ))}
      </View>
    </View>
  )
}

export default TrendChart
