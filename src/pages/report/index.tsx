import React, { useMemo, useState, useRef } from 'react'
import { View, Text, Button, Canvas, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useSleepStore } from '@/store/SleepStore'
import { getSleepQuality, getFactorTips } from '@/utils'
import classnames from 'classnames'
import styles from './index.module.scss'

const ReportPage: React.FC = () => {
  const { records, profile } = useSleepStore()
  const [previewVisible, setPreviewVisible] = useState(false)
  const [shareImage, setShareImage] = useState('')
  const canvasRef = useRef<any>(null)
  const isGenerating = useRef(false)

  const reportData = useMemo(() => {
    const last30 = records.slice(-30)
    const last7 = records.slice(-7)
    if (last30.length === 0) {
      return { avg30Score: 0, avg7Score: 0, avgDuration: '0', avgWake: '0', avgCoffee: '0', avgExercise: 0, bestDay: null, worstDay: null }
    }
    const avg30Score = Math.round(last30.reduce((s, r) => s + r.score, 0) / last30.length)
    const avg7Score = Math.round(last7.reduce((s, r) => s + r.score, 0) / last7.length)
    const avgDuration = (last30.reduce((s, r) => s + r.duration, 0) / last30.length).toFixed(1)
    const avgWake = (last30.reduce((s, r) => s + r.nightWakeCount, 0) / last30.length).toFixed(1)
    const avgCoffee = (last30.reduce((s, r) => s + r.coffeeIntake, 0) / last30.length).toFixed(1)
    const avgExercise = Math.round(last30.reduce((s, r) => s + r.exerciseDuration, 0) / last30.length)
    const bestDay = last30.reduce((best, r) => r.score > best.score ? r : best, last30[0])
    const worstDay = last30.reduce((worst, r) => r.score < worst.score ? r : worst, last30[0])
    return { avg30Score, avg7Score, avgDuration, avgWake, avgCoffee, avgExercise, bestDay, worstDay }
  }, [records])

  const factorTips = useMemo(() => getFactorTips(records.slice(-30)), [records])

  const wrapText = (ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    let line = ''
    let lineCount = 0
    for (let i = 0; i < text.length; i++) {
      const testLine = line + text[i]
      const metrics = ctx.measureText ? ctx.measureText(testLine) : { width: testLine.length * 12 }
      const testWidth = metrics.width
      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, y)
        line = text[i]
        y += lineHeight
        lineCount++
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, y)
    return lineCount + 1
  }

  const drawReportCanvas = (ctx: any, canvasWidth: number, canvasHeight: number) => {
    const w = canvasWidth
    const h = canvasHeight

    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#F0ECF9')
    gradient.addColorStop(1, '#FFFFFF')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    const headerGradient = ctx.createLinearGradient(0, 0, 0, 180)
    headerGradient.addColorStop(0, '#5B5FC7')
    headerGradient.addColorStop(1, '#8B7EC8')
    ctx.fillStyle = headerGradient
    ctx.fillRect(0, 0, w, 180)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('睡眠健康报告', 24, 48)

    const quality = getSleepQuality(reportData.avg30Score)
    ctx.font = 'bold 52px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`${reportData.avg30Score} 分`, 24, 110)

    ctx.fillStyle = quality.color
    ctx.fillRect(180, 78, 76, 32)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '16px sans-serif'
    ctx.fillText(quality.text, 192, 102)

    ctx.font = '14px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillText(`${profile.name} · ${new Date().toLocaleDateString()}`, 24, 145)
    ctx.fillText('近30天数据统计', 24, 165)

    let y = 205

    ctx.fillStyle = '#1A1B3E'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('📈 趋势变化', 24, y)
    y += 24

    const trendY = y
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(24, trendY, w - 48, 100)

    const scoreDiff = reportData.avg7Score - reportData.avg30Score
    const diffText = scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`
    const diffColor = scoreDiff >= 0 ? '#52C41A' : '#FF7875'

    ctx.fillStyle = '#5E5D7D'
    ctx.font = '13px sans-serif'
    ctx.fillText('近30天均分', 40, trendY + 28)
    ctx.fillStyle = '#1A1B3E'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(`${reportData.avg30Score}`, 40, trendY + 58)

    ctx.fillStyle = '#5E5D7D'
    ctx.font = '13px sans-serif'
    ctx.fillText('近7天均分', w / 2 + 12, trendY + 28)
    ctx.fillStyle = '#1A1B3E'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(`${reportData.avg7Score}`, w / 2 + 12, trendY + 58)

    ctx.fillStyle = diffColor
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText(`${diffText}分`, 40, trendY + 88)
    ctx.fillStyle = '#5E5D7D'
    ctx.font = '12px sans-serif'
    ctx.fillText(scoreDiff >= 0 ? '较近30天提升' : '较近30天下降', 80, trendY + 88)

    if (reportData.bestDay) {
      ctx.fillStyle = '#FAAD14'
      ctx.font = '12px sans-serif'
      ctx.fillText(`🏆 最佳 ${reportData.bestDay.date.slice(5)}`, w / 2 + 12, trendY + 88)
    }

    y = trendY + 120

    ctx.fillStyle = '#1A1B3E'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('📊 数据概览', 24, y)
    y += 24

    const stats = [
      { label: '平均睡眠时长', value: `${reportData.avgDuration} 小时`, icon: '⏱️' },
      { label: '平均夜醒次数', value: `${reportData.avgWake} 次`, icon: '😴' },
      { label: '日均咖啡摄入', value: `${reportData.avgCoffee} 杯`, icon: '☕' },
      { label: '日均运动时长', value: `${reportData.avgExercise} 分钟`, icon: '🏃' }
    ]

    stats.forEach((stat, i) => {
      const rowY = y + 12 + i * 48
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(24, rowY - 10, w - 48, 42)

      ctx.fillStyle = '#5E5D7D'
      ctx.font = '15px sans-serif'
      ctx.fillText(`${stat.icon}  ${stat.label}`, 40, rowY + 18)

      ctx.fillStyle = '#1A1B3E'
      ctx.font = 'bold 17px sans-serif'
      const textWidth = ctx.measureText ? ctx.measureText(stat.value).width : 80
      ctx.fillText(stat.value, w - 40 - textWidth, rowY + 18)
    })

    y += stats.length * 48 + 24

    ctx.fillStyle = '#1A1B3E'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('💡 改善建议', 24, y)
    y += 24

    const tips = factorTips.length > 0 ? factorTips.slice(0, 3) : [
      { factor: '继续保持', impact: 'positive' as const, message: '你的睡眠状态良好，请继续保持规律作息和健康生活习惯。' }
    ]

    tips.forEach((tip, i) => {
      const tipY = y + 12 + i * 80
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(24, tipY, w - 48, 72)

      const barColor = tip.impact === 'positive' ? '#52C41A' : '#FFB870'
      ctx.fillStyle = barColor
      ctx.fillRect(24, tipY, 4, 72)

      ctx.fillStyle = '#1A1B3E'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText(tip.factor, 40, tipY + 28)

      ctx.fillStyle = '#5E5D7D'
      ctx.font = '14px sans-serif'
      wrapText(ctx, tip.message, 40, tipY + 50, w - 100, 20)
    })

    y += tips.length * 80 + 30

    ctx.fillStyle = '#9A99B8'
    ctx.font = '13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('—— 好梦睡眠 · 科学睡眠健康管理 ——', w / 2, h - 24)
    ctx.textAlign = 'left'

    console.log('[Report] Canvas drawn, size:', w, 'x', h)
  }

  const generateShareImage = async () => {
    if (isGenerating.current) return
    isGenerating.current = true
    Taro.showLoading({ title: '生成中...', mask: true })

    try {
      const query = Taro.createSelectorQuery()
      query.select('#reportCanvas')
        .fields({ node: true, size: true })
        .exec((res: any) => {
          console.log('[Report] Canvas query result:', res)
          if (!res || !res[0] || !res[0].node) {
            Taro.hideLoading()
            Taro.showToast({ title: '生成失败，试试截屏分享', icon: 'none' })
            isGenerating.current = false
            setTimeout(() => {
              setPreviewVisible(true)
            }, 300)
            return
          }

          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = Taro.getSystemInfoSync().pixelRatio || 2
          const canvasWidth = 375
          const canvasHeight = 600

          canvas.width = canvasWidth * dpr
          canvas.height = canvasHeight * dpr
          ctx.scale(dpr, dpr)

          drawReportCanvas(ctx, canvasWidth, canvasHeight)

          setTimeout(() => {
            Taro.canvasToTempFilePath({
              canvas: canvas,
              x: 0,
              y: 0,
              width: canvasWidth,
              height: canvasHeight,
              destWidth: canvasWidth * 2,
              destHeight: canvasHeight * 2,
              success: (result: any) => {
                console.log('[Report] Image generated:', result.tempFilePath)
                setShareImage(result.tempFilePath)
                setPreviewVisible(true)
                Taro.hideLoading()
                isGenerating.current = false
              },
              fail: (err: any) => {
                console.error('[Report] Canvas to temp failed:', err)
                Taro.hideLoading()
                Taro.showToast({ title: '生成失败，请截屏分享', icon: 'none' })
                isGenerating.current = false
                setPreviewVisible(true)
              }
            })
          }, 200)
        })
    } catch (e) {
      console.error('[Report] Generate image error:', e)
      Taro.hideLoading()
      Taro.showToast({ title: '生成失败，请截屏分享', icon: 'none' })
      isGenerating.current = false
    }
  }

  const handleShare = () => {
    generateShareImage()
  }

  const handleExport = () => {
    generateShareImage()
  }

  const saveImage = () => {
    if (!shareImage) return
    Taro.saveImageToPhotosAlbum({
      filePath: shareImage,
      success: () => {
        Taro.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: (err: any) => {
        console.error('[Report] Save image failed:', err)
        if (err.errMsg?.includes('auth deny')) {
          Taro.showModal({
            title: '提示',
            content: '需要相册权限才能保存图片，请在设置中开启',
            showCancel: false
          })
        } else {
          Taro.showToast({ title: '保存失败', icon: 'none' })
        }
      }
    })
  }

  const quality = getSleepQuality(reportData.avg30Score)
  const scoreTrend = reportData.avg7Score - reportData.avg30Score

  return (
    <View className={styles.page}>
      <View className={styles.heroCard}>
        <Text className={styles.heroTitle}>近30天睡眠报告</Text>
        <View className={styles.heroScoreRow}>
          <Text className={styles.heroScore}>{reportData.avg30Score}</Text>
          <Text className={styles.heroUnit}>分</Text>
          <Text className={styles.heroQuality} style={{ background: `${quality.color}40` }}>
            {quality.text}
          </Text>
        </View>
        <Text className={styles.heroDesc}>
          你好，{profile.name}！过去一个月你的睡眠{quality.text}，
          {scoreTrend >= 0 ? `近一周表现优于平均水平 ${scoreTrend}分，继续保持！` : `近一周略有下降，需要注意调整作息。`}
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>数据概览</Text>
        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>⏱️</Text>平均睡眠时长
            </Text>
            <Text className={`${styles.summaryValue} ${Number(reportData.avgDuration) >= 7 ? styles.summaryValueGood : styles.summaryValueWarn}`}>
              {reportData.avgDuration} 小时
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>😴</Text>平均夜醒次数
            </Text>
            <Text className={`${styles.summaryValue} ${Number(reportData.avgWake) <= 1 ? styles.summaryValueGood : styles.summaryValueBad}`}>
              {reportData.avgWake} 次
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>☕</Text>日均咖啡摄入
            </Text>
            <Text className={`${styles.summaryValue} ${Number(reportData.avgCoffee) <= 2 ? styles.summaryValueGood : styles.summaryValueWarn}`}>
              {reportData.avgCoffee} 杯
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <Text className={styles.summaryIcon}>🏃</Text>日均运动时长
            </Text>
            <Text className={`${styles.summaryValue} ${reportData.avgExercise >= 30 ? styles.summaryValueGood : ''}`}>
              {reportData.avgExercise} 分钟
            </Text>
          </View>
          {reportData.bestDay && (
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>
                <Text className={styles.summaryIcon}>🏆</Text>睡眠最佳日期
              </Text>
              <Text className={styles.summaryValue}>{reportData.bestDay.date}</Text>
            </View>
          )}
          {reportData.worstDay && (
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>
                <Text className={styles.summaryIcon}>📉</Text>睡眠较差日期
              </Text>
              <Text className={styles.summaryValue}>{reportData.worstDay.date}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>改善建议</Text>
        {factorTips.length > 0 ? factorTips.map((tip, idx) => (
          <View key={idx} className={styles.adviceCard}>
            <View className={styles.adviceHeader}>
              <View className={styles.adviceIcon} style={{
                background: tip.impact === 'positive'
                  ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.15), rgba(82, 196, 26, 0.1))'
                  : 'linear-gradient(135deg, rgba(255, 184, 112, 0.2), rgba(255, 154, 80, 0.15))'
              }}>
                <Text>{tip.impact === 'positive' ? '✓' : '💡'}</Text>
              </View>
              <View className={styles.adviceContent}>
                <Text className={styles.adviceTitle}>{tip.factor}</Text>
                <Text className={styles.adviceText}>{tip.message}</Text>
              </View>
            </View>
          </View>
        )) : (
          <View className={styles.adviceCard}>
            <View className={styles.adviceHeader}>
              <View className={styles.adviceIcon}>
                <Text>✨</Text>
              </View>
              <View className={styles.adviceContent}>
                <Text className={styles.adviceTitle}>继续保持</Text>
                <Text className={styles.adviceText}>你的睡眠状态良好，请继续保持规律作息和健康生活习惯。</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader} style={{ marginBottom: '0' }}>
          <Text className={styles.sectionTitle}>定制改善计划</Text>
        </View>
        <View
          className={styles.planCard}
          onClick={() => Taro.navigateTo({ url: '/pages/improvement-plan/index' })}
        >
          <View className={styles.planCardLeft}>
            <Text className={styles.planCardIcon}>🌟</Text>
            <View>
              <Text className={styles.planCardTitle}>7天睡眠改善计划</Text>
              <Text className={styles.planCardDesc}>
                根据你的睡眠数据，生成专属改善目标
              </Text>
            </View>
          </View>
          <Text className={styles.planCardArrow}>›</Text>
        </View>
      </View>

      <View className={styles.canvasContainer}>
        <Canvas
          id="reportCanvas"
          type="2d"
          ref={canvasRef}
          style={{ width: '375px', height: '600px' }}
        />
      </View>

      <View className={styles.shareSection}>
        <View className={styles.shareRow}>
          <Button className={`${styles.shareBtn} ${styles.btnSecondary}`} onClick={handleExport}>生成图片</Button>
          <Button className={`${styles.shareBtn} ${styles.btnPrimary}`} onClick={handleShare}>分享报告</Button>
        </View>
        <Text className={styles.infoFooter}>报告生成于 {new Date().toLocaleDateString()}</Text>
      </View>

      {previewVisible && (
        <View className={styles.previewModal} onClick={() => setPreviewVisible(false)}>
          {shareImage ? (
            <Image className={styles.previewImage} src={shareImage} mode="aspectFit" showMenuByLongpress />
          ) : (
            <View className={styles.heroCard} style={{ width: '80%' }}>
              <Text className={styles.heroTitle}>近30天睡眠报告</Text>
              <View className={styles.heroScoreRow}>
                <Text className={styles.heroScore}>{reportData.avg30Score}</Text>
                <Text className={styles.heroUnit}>分</Text>
              </View>
              <Text className={styles.heroDesc}>
                平均睡眠 {reportData.avgDuration} 小时 · 咖啡 {reportData.avgCoffee} 杯/日
              </Text>
            </View>
          )}
          <View className={styles.previewActions}>
            {shareImage && (
              <Button className={classnames(styles.previewBtn, styles.previewBtnSave)} onClick={saveImage}>
                保存到相册
              </Button>
            )}
            <Button className={classnames(styles.previewBtn, styles.previewBtnCancel)} onClick={() => setPreviewVisible(false)}>
              关闭
            </Button>
          </View>
          <Text className={styles.previewTip}>
            {shareImage ? '长按图片可分享给好友' : '请截屏保存或分享'}
          </Text>
        </View>
      )}
    </View>
  )
}

export default ReportPage
