/*
 * @Description: 放置
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-30 14:40:16
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'

// import 新建 from '@/editor/components/toolbar/icons/新建.svg?react'

const Insert = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const view = useContext(EditorContext)

  useEffect(() => {
    if (!view) return

  }, [view])

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className='text-12px ml-10px'>文本</span>,
    },
    {
      key: '2',
      label: <span className='text-12px ml-10px'>母线线</span>,
    },
    {
      key: '3',
      label: <span className='text-12px ml-10px'>直线</span>,
    },
    {
      key: '4',
      label: <span className='text-12px ml-10px'>矩形</span>,
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{minWidth:'188px'}}>
      <Button type="text">放置</Button>
    </Dropdown>
  )
}

export default Insert
