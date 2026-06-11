import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useSleepStore } from '@/store/SleepStore'
import styles from './index.module.scss'

const SettingsPage: React.FC = () => {
  const { profile, updateProfile, resetData } = useSleepStore()

  const handleChangeTarget = (delta: number) => {
    const newValue = Math.min(12, Math.max(4, profile.targetSleepHours + delta))
    updateProfile({ targetSleepHours: newValue })
  }

  const handleResetData = () => {
    Taro.showModal({
      title: '重置数据',
      content: '确定要重置所有睡眠数据吗？此操作不可撤销。',
      confirmText: '确定重置',
      confirmColor: '#FF4D4F',
      success: (res) => {
        if (res.confirm) {
          resetData()
        }
      }
    })
  }

  const handleItemClick = (type: string) => {
    console.log('[Settings] Click item', type)
    if (type === 'report') {
      Taro.navigateTo({ url: '/pages/report/index' })
    } else if (type === 'reset') {
      handleResetData()
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.profileCard}>
        <View className={styles.profileRow}>
          <View className={styles.avatar}>
            <Text>👤</Text>
          </View>
          <View className={styles.profileInfo}>
            <Text className={styles.name}>{profile.name}</Text>
            <Text className={styles.meta}>{profile.age}岁 · 目标睡眠 {profile.targetSleepHours} 小时</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>睡眠目标</Text>
        <View className={styles.targetCard}>
          <View className={styles.targetHeader}>
            <Text className={styles.targetLabel}>每日睡眠时长目标</Text>
          </View>
          <View className={styles.targetSlider}>
            <Button className={styles.targetBtn} onClick={() => handleChangeTarget(-0.5)}>−</Button>
            <Text className={styles.targetValue}>
              {profile.targetSleepHours}
              <Text className={styles.targetUnit}> 小时</Text>
            </Text>
            <Button className={styles.targetBtn} onClick={() => handleChangeTarget(0.5)}>+</Button>
          </View>
          <Text className={styles.targetTip}>推荐成年人睡眠时长为 7-9 小时</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>数据管理</Text>
        <View className={styles.listCard}>
          <View className={styles.listItem} onClick={() => handleItemClick('report')}>
            <View className={styles.listIcon}><Text>📄</Text></View>
            <Text className={styles.listLabel}>导出睡眠报告</Text>
            <Text className={styles.listValue}>分享给医生/家人</Text>
            <Text className={styles.listArrow}>›</Text>
          </View>
          <View className={styles.listItem} onClick={() => handleItemClick('export')}>
            <View className={styles.listIcon}><Text>📊</Text></View>
            <Text className={styles.listLabel}>导出数据</Text>
            <Text className={styles.listValue}>CSV/Excel</Text>
            <Text className={styles.listArrow}>›</Text>
          </View>
          <View className={styles.listItem} onClick={() => handleItemClick('reset')}>
            <View className={styles.listIcon}><Text>🔄</Text></View>
            <Text className={styles.listLabel}>重置所有数据</Text>
            <Text className={styles.listValue}>恢复初始状态</Text>
            <Text className={styles.listArrow}>›</Text>
          </View>
          <View className={styles.listItem} onClick={() => handleItemClick('sync')}>
            <View className={styles.listIcon}><Text>☁️</Text></View>
            <Text className={styles.listLabel}>云同步</Text>
            <Text className={styles.listValue}>已开启</Text>
            <Text className={styles.listArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>其他</Text>
        <View className={styles.listCard}>
          <View className={styles.listItem} onClick={() => handleItemClick('about')}>
            <View className={styles.listIcon}><Text>ℹ️</Text></View>
            <Text className={styles.listLabel}>关于我们</Text>
            <Text className={styles.listValue}>v1.0.0</Text>
            <Text className={styles.listArrow}>›</Text>
          </View>
          <View className={styles.listItem} onClick={() => handleItemClick('feedback')}>
            <View className={styles.listIcon}><Text>💬</Text></View>
            <Text className={styles.listLabel}>意见反馈</Text>
            <Text className={styles.listArrow}>›</Text>
          </View>
          <View className={styles.listItem} onClick={() => handleItemClick('privacy')}>
            <View className={styles.listIcon}><Text>🔒</Text></View>
            <Text className={styles.listLabel}>隐私政策</Text>
            <Text className={styles.listArrow}>›</Text>
          </View>
        </View>
      </View>

      <Button className={styles.logoutBtn} onClick={handleLogout}>退出登录</Button>
    </View>
  )
}

export default SettingsPage
