/*
 * @Description: 工具按钮
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-31 16:22:48
 */

import { Button, Divider, Tooltip, Upload } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { isWindows } from '@/dxEditor/utils'
import EditorContext from '@/dxEditor/context'

import 新建 from '@/dxEditor/components/toolbar/icons/新建.svg?react'
import 保存 from '@/dxEditor/components/toolbar/icons/保存.svg?react'
import 撤销 from '@/dxEditor/components/toolbar/icons/撤销.svg?react'
import 重做 from '@/dxEditor/components/toolbar/icons/重做.svg?react'
import 复制 from '@/dxEditor/components/toolbar/icons/复制.svg?react'
import 剪切 from '@/dxEditor/components/toolbar/icons/剪切.svg?react'
import 粘贴 from '@/dxEditor/components/toolbar/icons/粘贴.svg?react'
import 删除 from '@/dxEditor/components/toolbar/icons/删除.svg?react'
import 查找 from '@/dxEditor/components/toolbar/icons/查找.svg?react'
import 放大 from '@/dxEditor/components/toolbar/icons/放大.svg?react'
import 缩小 from '@/dxEditor/components/toolbar/icons/缩小.svg?react'
import 适合窗口 from '@/dxEditor/components/toolbar/icons/适合窗口.svg?react'
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
import 拖拽 from '@/dxEditor/components/toolbar/icons/拖拽.svg?react'
import 选择 from '@/dxEditor/components/toolbar/icons/选择.svg?react'
import 导线 from '@/dxEditor/components/toolbar/icons/导线.svg?react'
import 母线 from '@/dxEditor/components/toolbar/icons/母线.svg?react'
import 文字 from '@/dxEditor/components/toolbar/icons/文字.svg?react'
import 按钮 from '@/dxEditor/components/toolbar/icons/按钮.svg?react'
import 图片 from '@/dxEditor/components/toolbar/icons/图片.svg?react'

import ToolDrawWire from '@/dxEditor/tools/drawWire'
import ToolBase from '@/dxEditor/tools/toolBase'
import ToolDragCanvas from '@/dxEditor/tools/dragCanvas'
import { Queue } from '@/dxEditor/history/historyManager'
import ToolOperationGraph from '@/dxEditor/tools/operationGraph'
import ToolDrawText from '@/dxEditor/tools/drawText'
import ToolDrawBusbar from '@/dxEditor/tools/drawBusbar'
import ToolDrawBtn from '@/dxEditor/tools/drawBtn'
import ToolPasteGraph from '@/dxEditor/tools/pasteGraph'
import { EditorEvent } from '@/dxEditor/event'
import { degToRad } from '@/dxCanvas'
import ToolAddPic from '@/dxEditor/tools/addPic'

type Tool = {
  name: string
  tip: string
  icon: any
  keyboard?: string | string[],
  instance?: ToolBase
  disabled?: boolean
  action: () => void
}
const ToolBtn = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<Array<Tool[]>>([])
  const editor = useContext(EditorContext)

  useEffect(() => {
    if (!editor) return

    const tools: Array<Tool[]> = [
      [
        {
          name: '新建',
          tip: `新建`,
          icon: 新建,
          action: () => { }
        },
        {
          name: '保存',
          tip: `保存 ${isWindows ? 'Ctrl+S' : '⌘s'}`,
          icon: 保存,
          keyboard: 'ctrl+s',
          action: () => { }
        }
      ],
      [
        {
          name: '撤销',
          tip: `撤销 ${isWindows ? 'Ctrl+Z' : '⌘z'}`,
          icon: 撤销,
          keyboard: 'ctrl+z',
          disabled: true,
          action: editor.history.undo
        },
        {
          name: '重做',
          tip: `重做 ${isWindows ? 'Ctrl+Shift+Z' : '⌘⇧z'}`,
          icon: 重做,
          keyboard: 'ctrl+shift+z',
          disabled: true,
          action: editor.history.redo
        },
        {
          name: '复制',
          tip: `复制 ${isWindows ? 'Ctrl+C' : '⌘c'}`,
          icon: 复制,
          keyboard: 'ctrl+c',
          disabled: true,
          action: editor.keybord.hotkeys.copy
        },
        {
          name: '剪切',
          tip: `剪切 ${isWindows ? 'Ctrl+X' : '⌘x'}`,
          icon: 剪切,
          keyboard: 'ctrl+x',
          disabled: true,
          action: editor.keybord.hotkeys.cut
        },
        {
          name: '粘贴',
          tip: `粘贴 ${isWindows ? 'Ctrl+V' : '⌘v'}`,
          icon: 粘贴,
          keyboard: 'ctrl+v',
          disabled: true,
          instance: new ToolPasteGraph(editor),
          action: () => {
            if (editor.pasteData.children.length === 0) return
            editor.tool.setActiveTool('pasteGraph')
          }
        },
        {
          name: '删除',
          tip: `删除 ${isWindows ? 'delete' : 'backspace'}`,
          icon: 删除,
          disabled: true,
          keyboard: isWindows ? 'delete' : 'backspace',
          action: editor.keybord.hotkeys.deleteSelected
        }
      ],
      [
        {
          name: '查找',
          tip: `查找 ${isWindows ? 'Ctrl+F' : '⌘f'}`,
          icon: 查找,
          keyboard: 'ctrl+f',
          // disabled:true,
          action: () => { }
        },
        {
          name: '放大',
          tip: `放大 ${isWindows ? 'Ctrl+=' : '⌘+'}`,
          icon: 放大,
          keyboard: 'ctrl+=',
          action: editor.keybord.hotkeys.zoomIn
        },
        {
          name: '缩小',
          tip: `缩小 ${isWindows ? 'Ctrl+-' : '⌘-'}`,
          icon: 缩小,
          keyboard: 'ctrl+-',
          action: editor.keybord.hotkeys.zoomOut
        },
        {
          name: '适合窗口',
          tip: `适合窗口 ${isWindows ? 'Ctrl+1' : '⌘1'}`,
          icon: 适合窗口,
          keyboard: 'ctrl+1',
          action: editor.keybord.hotkeys.showAll
        },
      ],
      [
        {
          name: '逆时针旋转90度',
          tip: `逆时针旋转90度 ${isWindows ? 'Ctrl+←' : '⌘←'}`,
          icon: 逆时针旋转90度,
          keyboard: 'ctrl+arrowleft',
          disabled: true,
          action: () => editor.keybord.hotkeys.rotate(degToRad(-90))
        },
        {
          name: '顺时针旋转90度',
          tip: `顺时针旋转90度 ${isWindows ? 'Ctrl+→' : '⌘→'}`,
          icon: 顺时针旋转90度,
          keyboard: 'ctrl+arrowright',
          disabled: true,
          action: () => editor.keybord.hotkeys.rotate(degToRad(90))
        },
        {
          name: '水平翻转',
          tip: `水平翻转 X`,
          icon: 水平翻转,
          keyboard: 'x',
          disabled: true,
          action: () => editor.keybord.hotkeys.flip('x')
        },
        {
          name: '垂直翻转',
          tip: `垂直翻转 Y`,
          icon: 垂直翻转,
          keyboard: 'y',
          disabled: true,
          action: () => editor.keybord.hotkeys.flip('y')
        },
        {
          name: '左对齐',
          tip: `左对齐 ${isWindows ? 'Ctrl+Shift+L' : '⌘⇧l'}`,
          icon: 左对齐,
          keyboard: 'ctrl+shift+l',
          disabled: true,
          action: editor.keybord.hotkeys.alignLeft
        },
        {
          name: '右对齐',
          tip: `右对齐 ${isWindows ? 'Ctrl+Shift+R' : '⌘⇧r'}`,
          icon: 右对齐,
          keyboard: 'ctrl+shift+r',
          disabled: true,
          action: editor.keybord.hotkeys.alignRight
        },
        {
          name: '顶对齐',
          tip: `顶对齐 ${isWindows ? 'Ctrl+Shift+T' : '⌘⇧t'}`,
          icon: 顶对齐,
          keyboard: 'ctrl+shift+t',
          disabled: true,
          action: editor.keybord.hotkeys.alignTop
        },
        {
          name: '底对齐',
          tip: `底对齐 ${isWindows ? 'Ctrl+Shift+B' : '⌘⇧b'}`,
          icon: 底对齐,
          keyboard: 'ctrl+shift+b',
          disabled: true,
          action: editor.keybord.hotkeys.alignBottom
        },
        {
          name: '水平居中对齐',
          tip: `水平居中对齐 ${isWindows ? 'Ctrl+Shift+H' : '⌘⇧h'}`,
          icon: 水平居中对齐,
          keyboard: 'ctrl+shift+h',
          disabled: true,
          action: editor.keybord.hotkeys.horizontalCenter
        },
        {
          name: '垂直居中对齐',
          tip: `垂直居中对齐 ${isWindows ? 'Ctrl+Shift+E' : '⌘⇧e'}`,
          icon: 垂直居中对齐,
          keyboard: 'ctrl+shift+e',
          disabled: true,
          action: editor.keybord.hotkeys.verticalCenter
        },
        {
          name: '水平等距分布',
          tip: `水平等距分布 ${isWindows ? 'Ctrl+Alt+H' : '⌘⌥h'}`,
          icon: 水平等距分布,
          keyboard: 'ctrl+shift+e',
          disabled: true,
          action: editor.keybord.hotkeys.horizontalEquidistance
        },
        {
          name: '垂直等距分布',
          tip: `垂直等距分布 ${isWindows ? 'Ctrl+Alt+E' : '⌘⌥e'}`,
          icon: 垂直等距分布,
          keyboard: 'ctrl+shift+e',
          disabled: true,
          action: editor.keybord.hotkeys.verticalEquidistance
        },
      ],
      [
        {
          name: '选择',
          tip: `选择 A`,
          icon: 选择,
          keyboard: 'a',
          instance: new ToolOperationGraph(editor),
          action: () => {
            editor.tool.setActiveTool('operationGraph')
          }
        },
        {
          name: '拖拽',
          tip: `拖拽 H`,
          icon: 拖拽,
          keyboard: 'h',
          instance: new ToolDragCanvas(editor),
          action: () => {
            editor.tool.setActiveTool('dragCanvas')
          }
        },
        {
          name: '导线',
          tip: `导线 L`,
          icon: 导线,
          keyboard: 'l',
          instance: new ToolDrawWire(editor),
          action: () => {
            editor.tool.setActiveTool('drawWire')
          }
        },
        {
          name: '母线',
          tip: `母线 M`,
          icon: 母线,
          keyboard: 'm',
          instance: new ToolDrawBusbar(editor),
          action: () => {
            editor.tool.setActiveTool('drawBusbar')
          }
        },
        {
          name: '文本',
          tip: `文本 T`,
          icon: 文字,
          keyboard: 't',
          instance: new ToolDrawText(editor),
          action: () => {
            editor.tool.setActiveTool('drawText')
          }
        },
        // {
        //   name: '按钮',
        //   tip: `按钮 B`,
        //   icon: 按钮,
        //   keyboard: 'b',
        //   instance: new ToolDrawBtn(editor),
        //   action: () => {
        //     editor.tool.setActiveTool('drawBtn')
        //   }
        // },
      ],
    ]
    tools.flat().forEach(tool => {
      tool.instance && editor.tool.register(tool.instance)
      tool.keyboard && editor.keybord.register({
        keyboard: tool.keyboard,
        name: tool.name,
        action: tool.action
      })
    })
    editor.tool.register(new ToolAddPic(editor))
    setTools(tools)
    // 存储栈发生变化
    const historyChange = () => {
      const { current, queue } = editor.history
      const undoCmd = queue[current]
      const redoCmd = queue[current + 1]
      const 撤销 = tools.flat().find(tool => tool.name === '撤销')
      撤销 && (撤销.disabled = !undoCmd)
      const 重做 = tools.flat().find(tool => tool.name === '重做')
      重做 && (重做.disabled = !redoCmd)
      setTools(tools.slice())
    }
    const paste = (event: EditorEvent) => {
      editor.pastetype = event.type
      const 粘贴 = tools.flat().find(tool => tool.name === '粘贴')
      粘贴 && (粘贴.disabled = !(editor.pasteData.children.length > 0))
      setTools(tools.slice())
    }
    const selectChange = () => {
      // 元素选中发生变化
      const 复制 = tools.flat().find(tool => tool.name === '复制')
      复制 && (复制.disabled = !(editor.selector.list.length > 0))
      const 剪切 = tools.flat().find(tool => tool.name === '剪切')
      剪切 && (剪切.disabled = !(editor.selector.list.length > 0))
      const 删除 = tools.flat().find(tool => tool.name === '删除')
      删除 && (删除.disabled = !(editor.selector.list.length > 0))
      const 逆时针旋转90度 = tools.flat().find(tool => tool.name === '逆时针旋转90度')
      逆时针旋转90度 && (逆时针旋转90度.disabled = !(editor.selector.list.length > 0))
      const 顺时针旋转90度 = tools.flat().find(tool => tool.name === '顺时针旋转90度')
      顺时针旋转90度 && (顺时针旋转90度.disabled = !(editor.selector.list.length > 0))
      const 水平翻转 = tools.flat().find(tool => tool.name === '水平翻转')
      水平翻转 && (水平翻转.disabled = !(editor.selector.list.length > 0))
      const 垂直翻转 = tools.flat().find(tool => tool.name === '垂直翻转')
      垂直翻转 && (垂直翻转.disabled = !(editor.selector.list.length > 0))
      const 左对齐 = tools.flat().find(tool => tool.name === '左对齐')
      左对齐 && (左对齐.disabled = !(editor.selector.list.length > 1))
      const 右对齐 = tools.flat().find(tool => tool.name === '右对齐')
      右对齐 && (右对齐.disabled = !(editor.selector.list.length > 1))
      const 顶对齐 = tools.flat().find(tool => tool.name === '顶对齐')
      顶对齐 && (顶对齐.disabled = !(editor.selector.list.length > 1))
      const 底对齐 = tools.flat().find(tool => tool.name === '底对齐')
      底对齐 && (底对齐.disabled = !(editor.selector.list.length > 1))
      const 水平居中对齐 = tools.flat().find(tool => tool.name === '水平居中对齐')
      水平居中对齐 && (水平居中对齐.disabled = !(editor.selector.list.length > 1))
      const 垂直居中对齐 = tools.flat().find(tool => tool.name === '垂直居中对齐')
      垂直居中对齐 && (垂直居中对齐.disabled = !(editor.selector.list.length > 1))
      const 水平等距分布 = tools.flat().find(tool => tool.name === '水平等距分布')
      水平等距分布 && (水平等距分布.disabled = !(editor.selector.list.length > 1))
      const 垂直等距分布 = tools.flat().find(tool => tool.name === '垂直等距分布')
      垂直等距分布 && (垂直等距分布.disabled = !(editor.selector.list.length > 1))
      setTools(tools.slice())
    }
    editor.addEventListener(EditorEvent.HISTORY_CHANGE, historyChange)
    editor.addEventListener(EditorEvent.SELECT, selectChange)
    editor.addEventListener(EditorEvent.PASTE_CHANGE, paste)
    return () => {
      tools.flat().forEach(tool => {
        tool.instance && editor.tool.unRegister(tool.name)
        tool.keyboard && editor.keybord.unRegister(tool.name)
      })

      editor.removeEventListener(EditorEvent.HISTORY_CHANGE, historyChange)
      editor.removeEventListener(EditorEvent.SELECT, selectChange)
      editor.removeEventListener(EditorEvent.PASTE_CHANGE, paste)
    }
  }, [editor])


  const customRequest = (options: any) => {
    const url = URL.createObjectURL(options.file)
    editor?.tool.setActiveTool('addPic',url)
    
  }

  return (
    <div className="flex-1 flex items-center ">
      {
        tools.map((item, index) => (
          <div key={index} className='flex items-center '>
            {item.map(tool => (
              <Tooltip key={tool.name} placement="bottom" title={tool.tip} arrow={false}>
                <Button disabled={tool.disabled} type='text' className='w-28px h-28px p-6px mx-2px'
                  icon={<tool.icon style={{ fill: tool.disabled ? '#ccc' : '#000' }} />} onClick={tool.action} />
              </Tooltip>
            ))}
            {index !== tools.length - 1 && <Divider type="vertical" className='bg-#000' />}
          </div>
        ))
      }
      <div>
        <Upload
          showUploadList={false}
          maxCount={1}
          accept="image/svg"
          customRequest={customRequest}>
          <Tooltip placement="bottom" title='上传图片' arrow={false}>
            <Button type='text' className='w-28px h-28px p-6px mx-2px'
              icon={<图片 style={{ fill: '#000' }} />} />
          </Tooltip>
        </Upload>
      </div>
    </div>
  )
}

export default ToolBtn
