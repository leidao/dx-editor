/*
 * @Description: 格式
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-30 10:25:54
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'

import 逆时针旋转90度 from '@/editor/components/toolbar/icons/逆时针旋转90度.svg?react'
import 顺时针旋转90度 from '@/editor/components/toolbar/icons/顺时针旋转90度.svg?react'
import 水平翻转 from '@/editor/components/toolbar/icons/水平翻转.svg?react'
import 垂直翻转 from '@/editor/components/toolbar/icons/垂直翻转.svg?react'
import 左对齐 from '@/editor/components/toolbar/icons/左对齐.svg?react'
import 右对齐 from '@/editor/components/toolbar/icons/右对齐.svg?react'
import 顶对齐 from '@/editor/components/toolbar/icons/顶对齐.svg?react'
import 底对齐 from '@/editor/components/toolbar/icons/底对齐.svg?react'
import 水平居中对齐 from '@/editor/components/toolbar/icons/水平居中对齐.svg?react'
import 垂直居中对齐 from '@/editor/components/toolbar/icons/垂直居中对齐.svg?react'
import 水平等距分布 from '@/editor/components/toolbar/icons/水平等距分布.svg?react'
import 垂直等距分布 from '@/editor/components/toolbar/icons/垂直等距分布.svg?react'
import 移到顶层 from '@/editor/components/toolbar/icons/移到顶层.svg?react'
import 移到底层 from '@/editor/components/toolbar/icons/移到底层.svg?react'

const Format = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const editor = useContext(EditorContext)

  useEffect(() => {
    if (!editor) return

  }, [editor])

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className='text-12px ml-10px'>逆时针旋转90度</span>,
      icon: <逆时针旋转90度 />,
    },
    {
      key: '2',
      label: <span className='text-12px ml-10px'>顺时针旋转90度</span>,
      icon:<顺时针旋转90度/>
    },
    {
      key: '3',
      label: <span className='text-12px ml-10px'>水平翻转</span>,
      icon:<水平翻转/>
    },
    {
      key: '4',
      label: <span className='text-12px ml-10px'>垂直翻转</span>,
      icon:<垂直翻转/>
    },
    {
      type: 'divider',
    },
    {
      key: '5',
      label: <span className='text-12px ml-10px'>左对齐</span>,
      icon:<左对齐/>
    },
    {
      key: '6',
      label: <span className='text-12px ml-10px'>右对齐</span>,
      icon:<右对齐/>
    },
    {
      key: '7',
      label: <span className='text-12px ml-10px'>顶对齐</span>,
      icon:<顶对齐/>
    },
    {
      key: '8',
      label: <span className='text-12px ml-10px'>底对齐</span>,
      icon:<底对齐/>
    },
    {
      key: '9',
      label: <span className='text-12px ml-10px'>水平居中对齐</span>,
      icon:<水平居中对齐/>
    },
    {
      key: '10',
      label: <span className='text-12px ml-10px'>垂直居中对齐</span>,
      icon:<垂直居中对齐/>
    },
    {
      key: '11',
      label: <span className='text-12px ml-10px'>水平等距分布</span>,
      icon:<水平等距分布/>
    },
    {
      key: '12',
      label: <span className='text-12px ml-10px'>垂直等距分布</span>,
      icon:<垂直等距分布/>
    },
    {
      type: 'divider',
    },
    {
      key: '13',
      label: <span className='text-12px ml-10px'>移到顶层</span>,
      icon:<移到顶层/>
    },
    {
      key: '14',
      label: <span className='text-12px ml-10px'>移到底层</span>,
      icon:<移到底层/>
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{minWidth:'188px'}}>
      <Button type="text">格式</Button>
    </Dropdown>
  )
}

export default Format
