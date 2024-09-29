/*
 * @Description: 格式
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-29 17:04:08
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'
import { SettingOutlined } from '@ant-design/icons/lib/icons'



const Format = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const view = useContext(EditorContext)

  useEffect(() => {
    if (!view) return

  }, [view])

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span>新建</span>,
      icon: <SettingOutlined />,
    },
    {
      key: '2',
      label: <span>打开</span>,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: <span>保存</span>,
    },
    {
      key: '4',
      label: <span>另存为</span>,
    },
    {
      type: 'divider',
    },
    {
      key: '5',
      label: <span>导入</span>,
    },
    {
      key: '6',
      label: <span >导出</span>,
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" >
      <Button type="text">格式</Button>
    </Dropdown>
  )
}

export default Format
