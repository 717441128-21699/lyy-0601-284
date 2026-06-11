import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import styles from './index.module.scss'

interface RecordItemProps {
  icon: string
  label: string
  desc?: string
  value: number
  unit: string
  showControl?: boolean
  onIncrease?: () => void
  onDecrease?: () => void
}

const RecordItem: React.FC<RecordItemProps> = ({
  icon,
  label,
  desc,
  value,
  unit,
  showControl = false,
  onIncrease,
  onDecrease
}) => {
  return (
    <View className={styles.item}>
      <View className={styles.left}>
        <View className={styles.icon}>
          <Text>{icon}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.label}>{label}</Text>
          {desc && <Text className={styles.desc}>{desc}</Text>}
        </View>
      </View>
      <View className={styles.right}>
        {showControl ? (
          <View className={styles.controlGroup}>
            <Button className={styles.controlBtn} onClick={onDecrease}>−</Button>
            <Text className={styles.controlValue}>{value}</Text>
            <Button className={styles.controlBtn} onClick={onIncrease}>+</Button>
          </View>
        ) : (
          <>
            <Text className={styles.value}>
              {value}
              <Text className={styles.unit}> {unit}</Text>
            </Text>
          </>
        )}
      </View>
    </View>
  )
}

export default RecordItem
