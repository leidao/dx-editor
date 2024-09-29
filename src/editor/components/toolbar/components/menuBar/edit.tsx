/*
 * @Description: 编辑
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-29 17:18:23
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'
import { SettingOutlined } from '@ant-design/icons/lib/icons'



const Edit = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const view = useContext(EditorContext)

  useEffect(() => {
    if (!view) return

  }, [view])

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className='text-12px'>撤销</span>,
      icon: <SettingOutlined />,
    },
    {
      key: '2',
      label: <span className='text-12px'>重做</span>,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: <span className='text-12px'>复制</span>,
    },
    {
      key: '4',
      label: <span>剪切</span>,
    },
    {
      key: '5',
      label: <span>粘贴</span>,
    },
    {
      type: 'divider',
    },
    {
      key: '6',
      label: <span>删除</span>,
    },
    {
      key: '7',
      label: <span >拖拽</span>,
    },
    {
      type: 'divider',
    },
    {
      key: '8',
      label: <span >查找</span>,
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{minWidth:'188px',background:'#f9f9f9'}}>
      <Button type="text">编辑</Button>
    </Dropdown>
  )
}

export default Edit
