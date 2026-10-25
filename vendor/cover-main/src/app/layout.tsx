import type { Metadata } from 'next'
import './globals.css'
import './assets/css/patterns.css'
import { CoverProvider } from './components/coverContext'

export const metadata: Metadata = {
  title: 'ThisCover 封面生成器 · 超赞工具箱',
  description: '免费、漂亮的封面生成器，支持 18+ 主题、3000+ 图标、29+ 商用字体，纯前端本地渲染',
  keywords: ['ThisCover', '封面生成器', 'Cover Generator', '免费设计', '公众号封面', '文章配图', '设计工具', '在线设计', 'chaozan', '超赞工具箱'],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: [{ url: '/favicon-180.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '256x256',
        url: '/logo.png'
      }
    ]
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='zh-CN'>
      <body className={`antialiased`}>
        <CoverProvider>{children}</CoverProvider>
      </body>
    </html>
  )
}
