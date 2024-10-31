/*
 * @Description: 放置
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-31 09:43:14
 */

import { Button, Divider, Dropdown, MenuProps, Popover, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/dxEditor/context'

import 文字 from '@/dxEditor/components/toolbar/icons/文字.svg?react'
import 导线 from '@/dxEditor/components/toolbar/icons/导线.svg?react'
import 母线 from '@/dxEditor/components/toolbar/icons/母线.svg?react'
import 按钮 from '@/dxEditor/components/toolbar/icons/按钮.svg?react'

const Insert = () => {
  const editor = useContext(EditorContext)
  const [open, setOpen] = useState(false);
  const [menus, setMenus] = useState<any[]>([])
  useEffect(() => {
    if (!editor) return
    const menus = [
      {
        name: '文本',
        tip: 'T',
        icon: 文字,
        action:  () => editor.tool.setActiveTool('drawText')
      },
      {
        name: '导线',
        tip: 'L',
        icon: 导线,
        action:  () => editor.tool.setActiveTool('drawWire')
      },
      {
        name: '母线',
        tip: 'M',
        icon: 母线,
        action:  () => editor.tool.setActiveTool('drawBusbar')
      },
      {
        name: '按钮',
        tip: 'B',
        icon: 按钮,
        action:  () =>  editor.tool.setActiveTool('drawBtn')
      },
    ];
    setMenus(menus)
  }, [editor])

  
  return (
    <Popover
      open={open}
      onOpenChange={(newOpen)=>setOpen(newOpen)}
      placement="bottomLeft"
      overlayStyle={{ minWidth: '188px' }}
      overlayInnerStyle={{ padding: '4px' }}
      arrow={false}
      content={menus?.map((menu, index) => {
        return menu.type === 'divider' ?
          <Divider className='my-2px' key={index}/> :
          <div key={index} className='flex items-center hover:bg-#f5f5f5 p-6px rounded-6px' onClick={() => {
            menu.action()
            setOpen(false);
          }} style={{ cursor: menu.disabled ? 'not-allowed' : 'pointer' }}>
            <menu.icon style={{ fill: menu.disabled ? '#ccc' : '#000' }} />
            <span className='text-12px ml-14px flex-1' style={{ color: menu.disabled ? '#ccc' : '#000' }}>{menu.name}</span>
            <span className='text-12px' style={{ color: menu.disabled ? '#ccc' : '#000' }}>{menu.tip}</span>
          </div>
      })}>
      <Button type="text">放置</Button>
    </Popover>
  )
}

export default Insert
