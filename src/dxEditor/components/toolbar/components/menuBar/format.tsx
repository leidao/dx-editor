/*
 * @Description: 格式
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-29 16:30:32
 */

import { Button, Divider, Dropdown, MenuProps, Popover, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/dxEditor/context'

import 逆时针旋转90度 from '@/dxEditor/components/toolbar/icons/逆时针旋转90度.svg?react'
import 顺时针旋转90度 from '@/dxEditor/components/toolbar/icons/顺时针旋转90度.svg?react'
import 水平翻转 from '@/dxEditor/components/toolbar/icons/水平翻转.svg?react'
import 垂直翻转 from '@/dxEditor/components/toolbar/icons/垂直翻转.svg?react'
import 左对齐 from '@/dxEditor/components/toolbar/icons/左对齐.svg?react'
import 右对齐 from '@/dxEditor/components/toolbar/icons/右对齐.svg?react'
import 顶对齐 from '@/dxEditor/components/toolbar/icons/顶对齐.svg?react'
import 底对齐 from '@/dxEditor/components/toolbar/icons/底对齐.svg?react'
import 水平居中对齐 from '@/dxEditor/components/toolbar/icons/水平居中对齐.svg?react'
import 垂直居中对齐 from '@/dxEditor/components/toolbar/icons/垂直居中对齐.svg?react'
import 水平等距分布 from '@/dxEditor/components/toolbar/icons/水平等距分布.svg?react'
import 垂直等距分布 from '@/dxEditor/components/toolbar/icons/垂直等距分布.svg?react'
import 移到顶层 from '@/dxEditor/components/toolbar/icons/移到顶层.svg?react'
import 移到底层 from '@/dxEditor/components/toolbar/icons/移到底层.svg?react'
import { degToRad } from '@/dxCanvas'
import { isWindows } from '@/dxEditor/utils'
import { EditorEvent } from '@/dxEditor/event'

const Format = () => {
  const [open, setOpen] = useState(false);
  const [menus, setMenus] = useState<any[]>([])
  const editor = useContext(EditorContext)

  useEffect(() => {
    if (!editor) return
    const menus = [
      {
        name: '逆时针旋转90度',
        tip: `${isWindows ? 'Ctrl+←' : '⌘←'}`,
        icon: 逆时针旋转90度,
        disabled: true,
        action: () => editor.keybord.hotkeys.rotate(degToRad(-90))
      },
      {
        name: '顺时针旋转90度',
        tip: `${isWindows ? 'Ctrl+→' : '⌘→'}`,
        icon: 顺时针旋转90度,
        disabled: true,
        action: () => editor.keybord.hotkeys.rotate(degToRad(90))
      },
      {
        name: '水平翻转',
        tip: `X`,
        icon: 水平翻转,
        disabled: true,
        action: () => editor.keybord.hotkeys.flip('x')
      },
      {
        name: '垂直翻转',
        tip: `Y`,
        icon: 垂直翻转,
        disabled: true,
        action: () => editor.keybord.hotkeys.flip('y')
      },
      {
        name: '左对齐',
        tip: `${isWindows ? 'Ctrl+Shift+L' : '⌘⇧l'}`,
        icon: 左对齐,
        disabled: true,
        action: editor.keybord.hotkeys.alignLeft
      },
      {
        name: '右对齐',
        tip: `${isWindows ? 'Ctrl+Shift+R' : '⌘⇧r'}`,
        icon: 右对齐,
        disabled: true,
        action: editor.keybord.hotkeys.alignRight
      },
      {
        name: '顶对齐',
        tip: `${isWindows ? 'Ctrl+Shift+T' : '⌘⇧t'}`,
        icon: 顶对齐,
        disabled: true,
        action: editor.keybord.hotkeys.alignTop
      },
      {
        name: '底对齐',
        tip: `${isWindows ? 'Ctrl+Shift+B' : '⌘⇧b'}`,
        icon: 底对齐,
        disabled: true,
        action: editor.keybord.hotkeys.alignBottom
      },
      {
        name: '水平居中对齐',
        tip: `${isWindows ? 'Ctrl+Shift+H' : '⌘⇧h'}`,
        icon: 水平居中对齐,
        disabled: true,
        action: editor.keybord.hotkeys.horizontalCenter
      },
      {
        name: '垂直居中对齐',
        tip: `${isWindows ? 'Ctrl+Shift+E' : '⌘⇧e'}`,
        icon: 垂直居中对齐,
        disabled: true,
        action: editor.keybord.hotkeys.verticalCenter
      },
      {
        name: '水平等距分布',
        tip: `${isWindows ? 'Ctrl+Alt+H' : '⌘⌥h'}`,
        icon: 水平等距分布,
        disabled: true,
        action: editor.keybord.hotkeys.horizontalEquidistance
      },
      {
        name: '垂直等距分布',
        tip: `${isWindows ? 'Ctrl+Alt+E' : '⌘⌥e'}`,
        icon: 垂直等距分布,
        disabled: true,
        action: editor.keybord.hotkeys.verticalEquidistance
      },
      {
        type: 'divider',
      },
      {
        name: '移到顶层',
        // tip: `${isWindows ? 'Ctrl+Alt+E' : '⌘⌥e'}`,
        icon: 移到顶层,
        disabled: true,
        action: () => { }

      },
      {
        name: '移到底层',
        // tip: `${isWindows ? 'Ctrl+Alt+E' : '⌘⌥e'}`,
        icon: 移到底层,
        disabled: true,
        action: () => { }
      },
    ];
    setMenus(menus)

    const selectChange = () => {
      // 元素选中发生变化
      const 复制 = menus.find(menu => menu.name === '复制')
      复制 && (复制.disabled = !(editor.selector.list.length > 0))
      const 剪切 = menus.find(menu => menu.name === '剪切')
      剪切 && (剪切.disabled = !(editor.selector.list.length > 0))
      const 删除 = menus.find(menu => menu.name === '删除')
      删除 && (删除.disabled = !(editor.selector.list.length > 0))
      const 逆时针旋转90度 = menus.find(menu => menu.name === '逆时针旋转90度')
      逆时针旋转90度 && (逆时针旋转90度.disabled = !(editor.selector.list.length > 0))
      const 顺时针旋转90度 = menus.find(menu => menu.name === '顺时针旋转90度')
      顺时针旋转90度 && (顺时针旋转90度.disabled = !(editor.selector.list.length > 0))
      const 水平翻转 = menus.find(menu => menu.name === '水平翻转')
      水平翻转 && (水平翻转.disabled = !(editor.selector.list.length > 0))
      const 垂直翻转 = menus.find(menu => menu.name === '垂直翻转')
      垂直翻转 && (垂直翻转.disabled = !(editor.selector.list.length > 0))
      const 左对齐 = menus.find(menu => menu.name === '左对齐')
      左对齐 && (左对齐.disabled = !(editor.selector.list.length > 1))
      const 右对齐 = menus.find(menu => menu.name === '右对齐')
      右对齐 && (右对齐.disabled = !(editor.selector.list.length > 1))
      const 顶对齐 = menus.find(menu => menu.name === '顶对齐')
      顶对齐 && (顶对齐.disabled = !(editor.selector.list.length > 1))
      const 底对齐 = menus.find(menu => menu.name === '底对齐')
      底对齐 && (底对齐.disabled = !(editor.selector.list.length > 1))
      const 水平居中对齐 = menus.find(menu => menu.name === '水平居中对齐')
      水平居中对齐 && (水平居中对齐.disabled = !(editor.selector.list.length > 1))
      const 垂直居中对齐 = menus.find(menu => menu.name === '垂直居中对齐')
      垂直居中对齐 && (垂直居中对齐.disabled = !(editor.selector.list.length > 1))
      const 水平等距分布 = menus.find(menu => menu.name === '水平等距分布')
      水平等距分布 && (水平等距分布.disabled = !(editor.selector.list.length > 1))
      const 垂直等距分布 = menus.find(menu => menu.name === '垂直等距分布')
      垂直等距分布 && (垂直等距分布.disabled = !(editor.selector.list.length > 1))
      setMenus(menus.slice())
    }
    editor.addEventListener(EditorEvent.SELECT, selectChange)

    return () => {
      editor.removeEventListener(EditorEvent.SELECT, selectChange)
    }
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
            <menu.icon style={{ fill: menu.disabled ? '#ccc' : '#000' }} />
            <span className='text-12px ml-14px flex-1' style={{ color: menu.disabled ? '#ccc' : '#000' }}>{menu.name}</span>
            <span className='text-12px' style={{ color: menu.disabled ? '#ccc' : '#000' }}>{menu.tip}</span>
          </div>
      })}>
      <Button type="text">格式</Button>
    </Popover>
  )
}

export default Format
