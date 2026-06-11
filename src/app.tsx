import React, { useEffect } from 'react'
import { useDidShow, useDidHide } from '@tarojs/taro'
import { SleepProvider } from './store/SleepStore'
import './app.scss'

function App(props) {
  useEffect(() => {})
  useDidShow(() => {})
  useDidHide(() => {})
  return <SleepProvider>{props.children}</SleepProvider>
}

export default App
