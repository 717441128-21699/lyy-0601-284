import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import RelaxCard from '@/components/RelaxCard'
import { noiseSources, mockChecklistItems } from '@/data/mockData'
import styles from './index.module.scss'

const RelaxPage: React.FC = () => {
  const [breathing, setBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'准备' | '吸气' | '屏息' | '呼气'>('准备')
  const [scale, setScale] = useState(1)
  const [playingNoiseId, setPlayingNoiseId] = useState<string | null>(null)
  const [checklist, setChecklist] = useState(mockChecklistItems)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioRef = useRef<any>(null)
  const wasPlayingRef = useRef<string | null>(null)

  useEffect(() => {
    audioRef.current = Taro.createInnerAudioContext()
    audioRef.current.loop = true
    audioRef.current.onPlay(() => {
      console.log('[Relax] Audio played')
    })
    audioRef.current.onPause(() => {
      console.log('[Relax] Audio paused')
    })
    audioRef.current.onStop(() => {
      console.log('[Relax] Audio stopped')
    })
    audioRef.current.onError((err: any) => {
      console.error('[Relax] Audio error', err)
      Taro.showToast({ title: '音频加载失败', icon: 'none' })
      if (audioRef.current) {
        try { audioRef.current.stop() } catch (e) {}
      }
      setPlayingNoiseId(null)
      wasPlayingRef.current = null
    })
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.stop()
          audioRef.current.destroy()
        } catch (e) {}
      }
    }
  }, [])

  useDidHide(() => {
    console.log('[Relax] Page did hide, stopping audio')
    if (audioRef.current && playingNoiseId) {
      wasPlayingRef.current = playingNoiseId
      try { audioRef.current.stop() } catch (e) {}
      setPlayingNoiseId(null)
    }
    if (breathing) {
      setBreathing(false)
    }
  })

  useDidShow(() => {
    console.log('[Relax] Page did show, wasPlaying:', wasPlayingRef.current)
    wasPlayingRef.current = null
  })

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

  const toggleNoise = (noiseId: string) => {
    const noise = noiseSources.find(n => n.id === noiseId)
    if (!noise || !audioRef.current) return

    if (playingNoiseId === noiseId) {
      try {
        audioRef.current.stop()
      } catch (e) {
        console.error('[Relax] Stop error:', e)
      }
      setPlayingNoiseId(null)
      wasPlayingRef.current = null
      console.log('[Relax] Stop noise:', noise.name)
    } else {
      try {
        audioRef.current.stop()
        audioRef.current.src = noise.url
        audioRef.current.play()
        setPlayingNoiseId(noiseId)
        wasPlayingRef.current = noiseId
        console.log('[Relax] Play noise:', noise.name, noise.url)
        Taro.showToast({ title: `播放 ${noise.name}`, icon: 'none', duration: 1500 })
      } catch (e) {
        console.error('[Relax] Play error:', e)
        Taro.showToast({ title: '播放失败，请稍后重试', icon: 'none' })
        setPlayingNoiseId(null)
        wasPlayingRef.current = null
      }
    }
  }

  const toggleCheckItem = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

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
        {noiseSources.map(item => (
          <View
            key={item.id}
            className={`${styles.noiseCard} ${playingNoiseId === item.id ? styles.noiseCardActive : ''}`}
            onClick={() => toggleNoise(item.id)}
          >
            <View className={styles.noiseIcon}>
              <Text>{playingNoiseId === item.id ? '🔊' : '🎵'}</Text>
            </View>
            <Text className={styles.noiseName}>{item.name}</Text>
            <Text className={styles.noiseDesc}>
              {item.duration}分钟 · {playingNoiseId === item.id ? '播放中' : '点击播放'}
            </Text>
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
