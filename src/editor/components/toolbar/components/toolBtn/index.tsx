/*
 * @Description: 工具按钮
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-06 11:02:26
 */

import { Button, Divider, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { isWindows } from '@/editor/utils'
import EditorContext from '@/editor/context'

import 新建 from '@/editor/components/toolbar/icons/新建.svg?react'
import 保存 from '@/editor/components/toolbar/icons/保存.svg?react'
import 撤销 from '@/editor/components/toolbar/icons/撤销.svg?react'
import 重做 from '@/editor/components/toolbar/icons/重做.svg?react'
import 复制 from '@/editor/components/toolbar/icons/复制.svg?react'
import 剪切 from '@/editor/components/toolbar/icons/剪切.svg?react'
import 粘贴 from '@/editor/components/toolbar/icons/粘贴.svg?react'
import 删除 from '@/editor/components/toolbar/icons/删除.svg?react'
import 查找 from '@/editor/components/toolbar/icons/查找.svg?react'
import 放大 from '@/editor/components/toolbar/icons/放大.svg?react'
import 缩小 from '@/editor/components/toolbar/icons/缩小.svg?react'
import 适合窗口 from '@/editor/components/toolbar/icons/适合窗口.svg?react'
import 逆时针旋转90度 from '@/editor/components/toolbar/icons/逆时针旋转90度.svg?react'
import 顺时针旋转90度 from '@/editor/components/toolbar/icons/顺时针旋转90度.svg?react'
import 水平翻转 from '@/editor/components/toolbar/icons/水平翻转.svg?react'
import 垂直翻转 from '@/editor/components/toolbar/icons/垂直翻转.svg?react'
import 左对齐 from '@/editor/components/toolbar/icons/左对齐.svg?react'
import 右对齐 from '@/editor/components/toolbar/icons/右对齐.svg?react'
import 顶对齐 from '@/editor/components/toolbar/icons/顶对齐.svg?react'
import 底对齐 from '@/editor/components/toolbar/icons/底对齐.svg?react'
import 水平居中对齐 from '@/editor/components/toolbar/icons/水平居中对齐.svg?react'
import 垂直居中对齐 from '@/editor/components/toolbar/icons/垂直居中对齐.svg?react'
import 水平等距分布 from '@/editor/components/toolbar/icons/水平等距分布.svg?react'
import 垂直等距分布 from '@/editor/components/toolbar/icons/垂直等距分布.svg?react'
import 导线 from '@/editor/components/toolbar/icons/导线.svg?react'
import 拖拽 from '@/editor/components/toolbar/icons/拖拽.svg?react'
import ToolDrawWire from '@/editor/manager/tools/drawWire'
import ToolBase from '@/editor/manager/tools/toolBase'
import ToolDragCanvas from '@/editor/manager/tools/dragCanvas'

type Tool = {
  name: string
  tip: string
  icon: JSX.Element
  keyboard?: string | string[],
  instance?: ToolBase
  action: () => void
}
const ToolBtn = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<Array<Tool[]>>([])
  const view = useContext(EditorContext)

  useEffect(() => {
    if (!view) return

    const tools:Array<Tool[]> = [
      [
        {
          name: '新建',
          tip: `新建`,
          icon: <新建 />,
          action: () => {}
        },
        {
          name: '保存',
          tip: `保存 ${isWindows ? 'Ctrl+S' : '⌘s'}`,
          icon: <保存 />,
          keyboard: 'ctrl+s',
          action: () => {}
        }
      ],
      [
        {
          name: '撤销',
          tip: `撤销 ${isWindows ? 'Ctrl+Z' : '⌘z'}`,
          icon: <撤销 />,
          keyboard: 'ctrl+z',
          action: () => {}
        },
        {
          name: '重做',
          tip: `重做 ${isWindows ? 'Ctrl+Shift+Z' : '⌘⇧z'}`,
          icon: <重做 />,
          keyboard: 'ctrl+shift+z',
          action: () => {}
        },
        {
          name: '复制',
          tip: `复制 ${isWindows ? 'Ctrl+C' : '⌘c'}`,
          icon: <复制 />,
          keyboard: 'ctrl+c',
          action: () => {}
        },
        {
          name: '剪切',
          tip: `剪切 ${isWindows ? 'Ctrl+X' : '⌘x'}`,
          icon: <剪切 />,
          keyboard: 'ctrl+x',
          action: () => {}
        },
        {
          name: '粘贴',
          tip: `粘贴 ${isWindows ? 'Ctrl+V' : '⌘v'}`,
          icon: <粘贴 />,
          keyboard: 'ctrl+v',
          action: () => {}
        },
        {
          name: '删除',
          tip: `删除 ${isWindows ? 'delete' : 'backspace'}`,
          icon: <删除 />,
          keyboard: isWindows ? 'delete' : 'backspace',
          action: () => {}
        }
      ],
      [
        {
          name: '查找',
          tip: `查找 ${isWindows ? 'Ctrl+F' : '⌘f'}`,
          icon: <查找 />,
          keyboard: 'ctrl+f',
          action: () => {}
        },
        {
          name: '放大',
          tip: `放大 ${isWindows ? 'Ctrl+=' : '⌘+'}`,
          icon: <放大 />,
          keyboard: 'ctrl+=',
          action: () => {}
        },
        {
          name: '缩小',
          tip: `缩小 ${isWindows ? 'Ctrl+-' : '⌘-'}`,
          icon: <缩小 />,
          keyboard: 'ctrl+-',
          action: () => {}
        },
        {
          name: '适合窗口',
          tip: `适合窗口 ${isWindows ? 'Ctrl+1' : '⌘1'}`,
          icon: <适合窗口 />,
          keyboard: 'ctrl+1',
          action: () => {}
        },
      ],
      [
        {
          name: '逆时针旋转90度',
          tip: `逆时针旋转90度 ${isWindows ? 'Ctrl+←' : '⌘←'}`,
          icon: <逆时针旋转90度 />,
          keyboard: 'ctrl+←',
          action: () => {}
        },
        {
          name: '顺时针旋转90度',
          tip: `顺时针旋转90度 ${isWindows ? 'Ctrl+→' : '⌘→'}`,
          icon: <顺时针旋转90度 />,
          keyboard: 'ctrl+→',
          action: () => {}
        },
        {
          name: '水平翻转',
          tip: `水平翻转 X`,
          icon: <水平翻转 />,
          keyboard: 'x',
          action: () => {}
        },
        {
          name: '垂直翻转',
          tip: `垂直翻转 Y`,
          icon: <垂直翻转 />,
          keyboard: 'y',
          action: () => {}
        },
        {
          name: '左对齐',
          tip: `左对齐 ${isWindows ? 'Ctrl+Shift+L' : '⌘⇧l'}`,
          icon: <左对齐 />,
          keyboard: 'ctrl+shift+l',
          action: () => {}
        },
        {
          name: '右对齐',
          tip: `右对齐 ${isWindows ? 'Ctrl+Shift+R' : '⌘⇧r'}`,
          icon: <右对齐 />,
          keyboard: 'ctrl+shift+r',
          action: () => {}
        },
        {
          name: '顶对齐',
          tip: `顶对齐 ${isWindows ? 'Ctrl+Shift+T' : '⌘⇧t'}`,
          icon: <顶对齐 />,
          keyboard: 'ctrl+shift+t',
          action: () => {}
        },
        {
          name: '底对齐',
          tip: `底对齐 ${isWindows ? 'Ctrl+Shift+B' : '⌘⇧b'}`,
          icon: <底对齐 />,
          keyboard: 'ctrl+shift+b',
          action: () => {}
        },
        {
          name: '水平居中对齐',
          tip: `水平居中对齐 ${isWindows ? 'Ctrl+Shift+H' : '⌘⇧h'}`,
          icon: <水平居中对齐 />,
          keyboard: 'ctrl+shift+h',
          action: () => {}
        },
        {
          name: '垂直居中对齐',
          tip: `垂直居中对齐 ${isWindows ? 'Ctrl+Shift+E' : '⌘⇧e'}`,
          icon: <垂直居中对齐 />,
          keyboard: 'ctrl+shift+e',
          action: () => {}
        },
        {
          name: '水平等距分布',
          tip: `水平等距分布 ${isWindows ? 'Ctrl+Alt+H' : '⌘⌥h'}`,
          icon: <水平等距分布 />,
          keyboard: 'ctrl+shift+e',
          action: () => {}
        },
        {
          name: '垂直等距分布',
          tip: `垂直等距分布 ${isWindows ? 'Ctrl+Alt+E' : '⌘⌥e'}`,
          icon: <垂直等距分布 />,
          keyboard: 'ctrl+shift+e',
          action: () => {}
        },
      ],
      [
        {
          name: '导线',
          tip: `导线 L`,
          icon: <导线 />,
          keyboard: 'l',
          instance: new ToolDrawWire(view),
          action: () => {
            view.manager.tools.setActiveTool('drawWire')
          }
        },
        {
          name: '拖拽',
          tip: `拖拽 H`,
          icon: <拖拽 />,
          keyboard: 'h',
          instance: new ToolDragCanvas(view),
          action: () => {
            view.manager.tools.setActiveTool('dragCanvas')
          }
        }
      ],
    ]
    tools.flat().forEach(tool => {
      tool.instance && view.manager.tools.register(tool.instance)
      tool.keyboard && view.manager.keybord.register({
        keyboard: tool.keyboard,
        name: tool.name,
        action: tool.action
      })
    })
    setTools(tools)
    return () => {
      tools.flat().forEach(tool => {
        tool.instance && view.manager.tools.unRegister(tool.name)
        tool.keyboard &&view.manager.keybord.unRegister(tool.name)
      })
    }
  }, [view])


  return (
    <div className="flex-1 flex items-center ">
      {
        tools.map((item, index) => (
          <div key={index} className='flex items-center '>
            {item.map(tool => (
              <Tooltip key={tool.name} placement="bottom" title={tool.tip} arrow={false}>
                <Button type='text' className='w-28px h-28px p-6px mx-2px' icon={tool.icon} onClick={tool.action}/>
              </Tooltip>
            ))}
            {index !== tools.length - 1 && <Divider type="vertical" className='bg-#000' />}
          </div>
        ))
      }
    </div>
  )
}

export default ToolBtn
