'use client'

import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function Head({ className }: { className?: string }) {

  return (
    <header className='h-14 fixed border-b top-0 z-40 w-full bg-white shadow-xs'>
      <div className={`h-full px-4 md:px-8 flex justify-between items-center ${className}`}>
        <div className='flex items-center gap-2'>
          {/* 返回超赞工具箱首页（一次点击，跳出本工具） */}
          <a
            href='/'
            aria-label='返回超赞工具箱首页'
            title='返回超赞工具箱首页'
            className='size-9 flex items-center justify-center rounded-full border border-gray-200 text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors'
          >
            <ArrowLeft size={17} />
          </a>
          <a className='h-full flex items-center cursor-pointer' href='/'>
            <Image src='/logo.png' alt='logo' width={28} height={28} priority />
            <div className='text-xl ml-2 font-bold font-mono text-primary'>chaozan</div>
          </a>
        </div>
        <div className='flex-1 flex items-center justify-between'>
          <div className='flex-1 flex items-center'>
          </div>
          <div className='h-full flex items-center justify-end'>
            <Button className='rounded-3xl'>
              <a href='https://github.com/mkmkgo/chaozan-toolbox' target='_blank' rel='noopener'>
                ⭐ Star on Github
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
