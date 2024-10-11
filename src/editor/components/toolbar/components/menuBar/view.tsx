/*
 * @Description: 视图
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-30 11:27:08
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'
import { SettingOutlined } from '@ant-design/icons/lib/icons'

import 适合窗口 from '@/editor/components/toolbar/icons/适合窗口.svg?react'
import { CheckOutlined } from '../../icons/check-outlined'

const View = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const editor = useContext(EditorContext)

  useEffect(() => {
    if (!editor) return

  }, [editor])

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className='text-12px ml-10px'>适合窗口</span>,
      icon: <适合窗口 />,
    },
    {
      type: 'divider',
    },
    {
      key: '2',
      label: <span className='text-12px ml-10px'>显示标尺</span>,
      icon: <CheckOutlined />,
    },

    {
      key: '3',
      label: <span className='text-12px ml-10px'>显示网格</span>,
      icon: <CheckOutlined />,
    },
    {
      key: '4',
      label: <span className='text-12px ml-10px'>十字光标</span>,
      icon: <CheckOutlined />,
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{ minWidth: '188px' }}>
      <Button type="text">视图</Button>
    </Dropdown>
  )
}

export default View
