/*
 * @Description: 编辑
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-30 10:17:18
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'

import 撤销 from '../../icons/撤销.svg?react'
import 重做 from '../../icons/重做.svg?react'
import 复制 from '../../icons/复制.svg?react'
import 剪切 from '../../icons/剪切.svg?react'
import 粘贴 from '../../icons/粘贴.svg?react'
import 删除 from '../../icons/删除.svg?react'
import 拖拽 from '../../icons/拖拽.svg?react'
import 查找 from '../../icons/查找.svg?react'

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
      label: <span className='text-12px ml-10px'>撤销</span>,
      icon:  <撤销/>
    },
    {
      key: '2',
      label: <span className='text-12px ml-10px'>重做</span>,
      icon:  <重做/>
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: <span className='text-12px ml-10px'>复制</span>,
      icon:  <复制/>
    },
    {
      key: '4',
      label: <span className='text-12px ml-10px'>剪切</span>,
      icon:  <剪切/>
    },
    {
      key: '5',
      label: <span className='text-12px ml-10px'>粘贴</span>,
      icon:  <粘贴/>
    },
    {
      type: 'divider',
    },
    {
      key: '6',
      label: <span className='text-12px ml-10px'>删除</span>,
      icon:  <删除/>
    },
    {
      key: '7',
      label: <span className='text-12px ml-10px'>拖拽</span>,
      icon:  <拖拽/>
    },
    {
      type: 'divider',
    },
    {
      key: '8',
      label: <span className='text-12px ml-10px'>查找</span>,
      icon:  <查找/>
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{ minWidth: '188px' }}>
      <Button type="text">编辑</Button>
    </Dropdown>
  )
}

export default Edit
