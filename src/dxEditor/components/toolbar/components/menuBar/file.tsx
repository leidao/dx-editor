/*
 * @Description: 文件
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-29 16:17:19
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/dxEditor/context'

import 新建 from '@/dxEditor/components/toolbar/icons/新建.svg?react'
import 打开 from '@/dxEditor/components/toolbar/icons/打开.svg?react'
import 保存 from '@/dxEditor/components/toolbar/icons/保存.svg?react'
import 另存为 from '@/dxEditor/components/toolbar/icons/另存为.svg?react'
import 导入 from '@/dxEditor/components/toolbar/icons/导入.svg?react'
import 导出 from '@/dxEditor/components/toolbar/icons/导出.svg?react'



const File = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const editor = useContext(EditorContext)

  useEffect(() => {
    if (!editor) return

  }, [editor])

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className='text-12px ml-10px'>新建</span>,
      icon: <新建 />,
    },
    {
      key: '2',
      label: <span className='text-12px ml-10px'>打开</span>,
      icon: <打开 />,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: <span className='text-12px ml-10px'>保存</span>,
      icon: <保存 />,
    },
    {
      key: '4',
      label: <span className='text-12px ml-10px'>另存为</span>,
      icon: <另存为 />,
    },
    {
      type: 'divider',
    },
    {
      key: '5',
      label: <span className='text-12px ml-10px'>导入</span>,
      icon: <导入 />,
    },
    {
      key: '6',
      label: <span className='text-12px ml-10px'>导出</span>,
      icon: <导出 />,
      onClick:()=>{
        console.log('===',editor?.tree.toJSON());
      }
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{minWidth:'188px'}}>
      <Button type="text">文件</Button>
    </Dropdown>
  )
}

export default File
