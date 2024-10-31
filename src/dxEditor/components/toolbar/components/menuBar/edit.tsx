/*
 * @Description: 编辑
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-29 16:16:11
 */

import { Button, Divider, Dropdown, MenuProps, Popover, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/dxEditor/context'

import 撤销 from '../../icons/撤销.svg?react'
import 重做 from '../../icons/重做.svg?react'
import 复制 from '../../icons/复制.svg?react'
import 剪切 from '../../icons/剪切.svg?react'
import 粘贴 from '../../icons/粘贴.svg?react'
import 删除 from '../../icons/删除.svg?react'
import 选择 from '../../icons/选择.svg?react'
import 拖拽 from '../../icons/拖拽.svg?react'
import 查找 from '../../icons/查找.svg?react'
import { isWindows } from '@/dxEditor/utils'
import { Queue } from '@/dxEditor/history/historyManager'
import { EditorEvent } from '@/dxEditor/event'

const Edit = () => {
  const editor = useContext(EditorContext)
  const [open, setOpen] = useState(false);
  const [menus, setMenus] = useState<any[]>([])

  useEffect(() => {
    if (!editor) return
    const menus = [
      {
        name: '撤销',
        tip: `${isWindows ? 'Ctrl+Z' : '⌘z'}`,
        icon: 撤销,
        disabled: true,
        action: editor.history.undo
      },
      {
        name: '重做',
        tip: `${isWindows ? 'Ctrl+Shift+Z' : '⌘⇧z'}`,
        icon: 重做,
        disabled: true,
        action: editor.history.redo
      },
      {
        type: 'divider',
      },
      {
        name: '复制',
        tip: `${isWindows ? 'Ctrl+C' : '⌘c'}`,
        icon: 复制,
        disabled: true,
        action: editor.keybord.hotkeys.copy
      },
      {
        name: '剪切',
        tip: `${isWindows ? 'Ctrl+X' : '⌘x'}`,
        icon: 剪切,
        disabled: true,
        action: editor.keybord.hotkeys.cut
      },
      {
        name: '粘贴',
        tip: `${isWindows ? 'Ctrl+V' : '⌘v'}`,
        icon: 粘贴,
        disabled: true,
        action: () => {
          if (editor.pasteData.children.length === 0) return
          editor.tool.setActiveTool('pasteGraph')
        }
      },
      {
        type: 'divider',
      },
      {
        name: '删除',
        tip: `${isWindows ? 'delete' : 'backspace'}`,
        icon: 删除,
        disabled: true,
        action: editor.keybord.hotkeys.deleteSelected
      },
      {
        name: '选择',
        tip: `A`,
        icon: 选择,
        action: () => {
          editor.tool.setActiveTool('operationGraph')
        }
      },
      {
        name: '拖拽',
        tip: `H`,
        icon: 拖拽,
        action: () => {
          editor.tool.setActiveTool('dragCanvas')
        }
      },
      {
        type: 'divider',
      },
      {
        name: '查找',
        tip: `${isWindows ? 'Ctrl+F' : '⌘f'}`,
        icon: 查找,
        action: () => { }
      },
    ];

    setMenus(menus)

    const historyChange = () => {
      const {queue,current} = editor.history
      const undoCmd = queue[current]
      const redoCmd = queue[current + 1]
      const 撤销 = menus.find(tool => tool.name === '撤销')
      撤销 && (撤销.disabled = !undoCmd)
      const 重做 = menus.find(tool => tool.name === '重做')
      重做 && (重做.disabled = !redoCmd)
      setMenus(menus.slice())
    }
    const paste = (event:EditorEvent) => {
      editor.pastetype = event.type
      const 粘贴 = menus.find(tool => tool.name === '粘贴')
      粘贴 && (粘贴.disabled = !(editor.pasteData.children.length > 0))
      setMenus(menus.slice())
    }
    const selectChange = () => {
      // 元素选中发生变化
      const 复制 = menus.find(tool => tool.name === '复制')
      复制 && (复制.disabled = !(editor.selector.list.length > 0))
      const 剪切 = menus.find(tool => tool.name === '剪切')
      剪切 && (剪切.disabled = !(editor.selector.list.length > 0))
      const 删除 = menus.find(tool => tool.name === '删除')
      删除 && (删除.disabled = !(editor.selector.list.length > 0))
      setMenus(menus.slice())
    }
    editor.addEventListener(EditorEvent.HISTORY_CHANGE, historyChange)
    editor.addEventListener(EditorEvent.SELECT, selectChange)
    editor.addEventListener(EditorEvent.PASTE_CHANGE, paste)
    return () => {
      editor.removeEventListener(EditorEvent.HISTORY_CHANGE, historyChange)
      editor.removeEventListener(EditorEvent.SELECT, selectChange)
      editor.removeEventListener(EditorEvent.PASTE_CHANGE, paste)
    }

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
      <Button type="text">编辑</Button>
    </Popover>
  )
}

export default Edit
