/*
 * @Description: 设置
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-30 10:37:47
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'

import 快捷键 from '@/editor/components/toolbar/icons/快捷键.svg?react'

const Preferences = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const editor = useContext(EditorContext)

  useEffect(() => {
    if (!editor) return

  }, [editor])

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className='text-12px ml-10px'>快捷键设置</span>,
      icon: <快捷键 />,
    },
    {
      key: '2',
      label: <span className='text-12px ml-10px'>系统设置</span>,
      icon: <span className='w-16px h-16px' />,
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{ minWidth: '188px' }}>
      <Button type="text">设置</Button>
    </Dropdown>
  )
}

export default Preferences
