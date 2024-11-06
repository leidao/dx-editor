/*
 * @Description: 视图
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-05 16:15:39
 */
import globalConfig from '@/dxEditor/config'
import { Button, Divider, Dropdown, MenuProps, Popover, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/dxEditor/context'

import 适合窗口 from '@/dxEditor/components/toolbar/icons/适合窗口.svg?react'
import { CheckOutlined } from '../../icons/check-outlined'
import { isWindows } from '@/dxEditor/utils'

const View = () => {
  const [open, setOpen] = useState(false);
  const [menus, setMenus] = useState<any[]>([])
  const editor = useContext(EditorContext)

  useEffect(() => {
    if (!editor) return
    const menus = [
      {
        name: '适合窗口',
        tip: `${isWindows ? 'Ctrl+1' : '⌘1'}`,
        icon: 适合窗口,
        isShow: () => true,
        action: editor.keybord.hotkeys.showAll
      },
      {
        type: 'divider',
      },
      {
        name: '显示标尺',
        icon: CheckOutlined,
        isShow: () => editor.ruler.visible,
        action: () => {
          editor.ruler.visible = !editor.ruler.visible
          editor.sky.render()
        }
      },

      {
        name: '显示网格',
        icon: CheckOutlined,
        isShow: () => editor.grid.visible,
        action: () => {
          editor.grid.visible = !editor.grid.visible
          editor.ground.render()
        }
      },
      {
        name: '十字光标',
        icon: CheckOutlined,
        isShow: () => globalConfig.guidelineVisible,
        action: () => {
          globalConfig.guidelineVisible = !globalConfig.guidelineVisible
          editor.sky.render()
        }
      },
    ];
    setMenus(menus)
  }, [editor])


  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => setOpen(newOpen)}
      placement="bottomLeft"
      overlayStyle={{ minWidth: '188px' }}
      overlayInnerStyle={{ padding: '4px' }}
      arrow={false}
      content={menus?.map((menu, index) => {
        return menu.type === 'divider' ?
          <Divider className='my-2px' key={index} /> :
          <div key={index} className='flex items-center hover:bg-#f5f5f5 p-6px rounded-6px' onClick={() => {
            menu.action()
            setOpen(false);
          }} style={{ cursor: menu.disabled ? 'not-allowed' : 'pointer' }}>
            {menu.isShow() ? <menu.icon style={{ fill: menu.disabled ? '#ccc' : '#000' }} /> : <div className='w-16px h-16px' />}
            <span className='text-12px ml-14px flex-1' style={{ color: menu.disabled ? '#ccc' : '#000' }}>{menu.name}</span>
            <span className='text-12px' style={{ color: menu.disabled ? '#ccc' : '#000' }}>{menu.tip}</span>
          </div>
      })}>
      <Button type="text">视图</Button>
    </Popover>
  )
}

export default View
