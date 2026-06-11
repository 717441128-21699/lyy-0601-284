import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Button } from '@tarojs/components'
import RelaxCard from '@/components/RelaxCard'
import { mockRelaxItems, mockChecklistItems } from '@/data/mockData'
import styles from './index.module.scss'

const RelaxPage: React.FC = () => {
  const [breathing, setBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'准备' | '吸气' | '屏息' | '呼气'>('准备')
  const [scale, setScale] = useState(1)
  const [playingNoise, setPlayingNoise] = useState<string | null>(null)
  const [checklist, setChecklist] = useState(mockChecklistItems)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (breathing) {
      const phases = [
        { name: '吸气' as const, duration: 4000, scale: 1.3 },
        { name: '屏息' as const, duration: 7000, scale: 1.3 },
        { name: '呼气' as const, duration: 8000, scale: 1 }
      ]
      let idx = 0
      const runPhase = () => {
        const phase = phases[idx % phases.length]
        setBreathPhase(phase.name)
        setScale(phase.scale)
        idx++
        timerRef.current = setTimeout(runPhase, phase.duration)
      }
      runPhase()
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      setBreathPhase('准备')
      setScale(1)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [breathing])

  const toggleNoise = (id: string) => {
    setPlayingNoise(prev => prev === id ? null : id)
    console.log('[Relax] Toggle noise', id, playingNoise === id ? 'stop' : 'play')
  }

  const toggleCheckItem = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const breathingItems = mockRelaxItems.filter(i => i.type === 'breathing')
  const noiseItems = mockRelaxItems.filter(i => i.type === 'whitenoise')

  return (
    <View className={styles.page}>
      <View className={styles.breathingSection}>
        <View className={styles.breathingCard}>
          <View className={styles.breathingHeader}>
            <Text className={styles.breathingTitle}>4-7-8 呼吸放松法</Text>
            <Text className={styles.breathingTag}>帮助入睡</Text>
          </View>
          <View className={styles.breathingCircleWrap}>
            <View
              className={styles.breathingCircle}
              style={{ transform: `scale(${scale})` }}
            >
              <View className={styles.breathingCircleInner}>
                <Text className={styles.breathingText}>{breathPhase}</Text>
              </View>
            </View>
            <Text className={styles.breathingHint}>跟随圆圈节奏呼吸 · 吸气4秒 屏息7秒 呼气8秒</Text>
          </View>
          <View className={styles.breathingControl}>
            <Button
              className={`${styles.controlBtn} ${breathing ? styles.btnSecondary : styles.btnPrimary}`}
              onClick={() => setBreathing(!breathing)}
            >
              {breathing ? '停止' : '开始训练'}
            </Button>
          </View>
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>白噪音</Text>
      </View>
      <View className={styles.noiseList}>
        {noiseItems.map(item => (
          <View
            key={item.id}
            className={`${styles.noiseCard} ${playingNoise === item.id ? styles.noiseCardActive : ''}`}
            onClick={() => toggleNoise(item.id)}
          >
            <View className={styles.noiseIcon}>
              <Text>{playingNoise === item.id ? '🔊' : '🎵'}</Text>
            </View>
            <Text className={styles.noiseName}>{item.title}</Text>
            <Text className={styles.noiseDesc}>{item.duration}分钟 · {playingNoise === item.id ? '播放中' : '点击播放'}</Text>
          </View>
        ))}
      </View>

      <View className={styles.checklistSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>睡前准备清单</Text>
        </View>
        <View className={styles.checklistCard}>
          {checklist.map(item => (
            <View
              key={item.id}
              className={styles.checklistItem}
              onClick={() => toggleCheckItem(item.id)}
            >
              <View className={`${styles.checkbox} ${item.checked ? styles.checkboxChecked : ''}`}>
                {item.checked && <Text className={styles.checkmark}>✓</Text>}
              </View>
              <Text className={`${styles.checklistText} ${item.checked ? styles.checklistTextChecked : ''}`}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default RelaxPage
