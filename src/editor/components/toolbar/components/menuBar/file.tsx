/*
 * @Description: 文件
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-29 18:07:34
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'
import { NewProject, Save, Open, SaveAs, ImportJson, ExportJson } from '@/editor/components/toolbar/icons'



const File = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const view = useContext(EditorContext)

  useEffect(() => {
    if (!view) return

  }, [view])

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className='text-12px ml-10px'>新建</span>,
      icon: <NewProject />,
    },
    {
      key: '2',
      label: <span className='text-12px ml-10px'>打开</span>,
      icon: <Open />,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: <span className='text-12px ml-10px'>保存</span>,
      icon: <Save />,
    },
    {
      key: '4',
      label: <span className='text-12px ml-10px'>另存为</span>,
      icon: <SaveAs />,
    },
    {
      type: 'divider',
    },
    {
      key: '5',
      label: <span className='text-12px ml-10px'>导入</span>,
      icon: <ImportJson />,
    },
    {
      key: '6',
      label: <span className='text-12px ml-10px'>导出</span>,
      icon: <ExportJson />,
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{minWidth:'188px',background:'#f9f9f9'}}>
      <Button type="text">文件</Button>
    </Dropdown>
  )
}

export default File
