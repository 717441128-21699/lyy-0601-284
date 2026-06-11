export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/trends/index',
    'pages/relax/index',
    'pages/reminders/index',
    'pages/settings/index',
    'pages/habits/index',
    'pages/report/index',
    'pages/record-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#5B5FC7',
    navigationBarTitleText: '睡眠健康',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#9A99B8',
    selectedColor: '#5B5FC7',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '记录'
      },
      {
        pagePath: 'pages/trends/index',
        text: '趋势'
      },
      {
        pagePath: 'pages/relax/index',
        text: '放松'
      },
      {
        pagePath: 'pages/reminders/index',
        text: '提醒'
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置'
      }
    ]
  }
})
