'use client'

import React, { createContext, useState, useEffect } from 'react'
import { DEFAULT_SETTING, DEFAULT_UNSPLASH_PARAM } from '../settings/default'

const CoverContext = createContext<CoverContextType>({
  coverSetting: DEFAULT_SETTING,
  setCoverSetting: () => {},
  unsplashParam: DEFAULT_UNSPLASH_PARAM,
  setUnsplashParam: () => {},
  selectedGradientColorKey: 'red',
  setSelectedGradientColorKey: () => {},
  applyTemplate: () => {}
})

const CoverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coverSetting, setCoverSetting] = useState(DEFAULT_SETTING)
  const [unsplashParam, setUnsplashParam] = useState(DEFAULT_UNSPLASH_PARAM)
  const [selectedGradientColorKey, setSelectedGradientColorKey] = useState('red')

  const applyTemplate = (templateData: Setting) => {
    setCoverSetting({ ...DEFAULT_SETTING, ...templateData })
    localStorage.setItem('coverSetting', JSON.stringify({ ...DEFAULT_SETTING, ...templateData }))
  }

  // 整页跳转（静态导出 + 子路径下客户端路由不可用）后，从 sessionStorage 恢复所选模板。
  // 由首页“使用此模版”写入，读取后立即清除。
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('cz_selected_template')
      if (raw) {
        applyTemplate(JSON.parse(raw))
        sessionStorage.removeItem('cz_selected_template')
      }
    } catch {}
  }, [])

  return <CoverContext.Provider value={{ coverSetting, setCoverSetting, unsplashParam, setUnsplashParam, selectedGradientColorKey, setSelectedGradientColorKey, applyTemplate }}>{children}</CoverContext.Provider>
}

export { CoverProvider, CoverContext }
