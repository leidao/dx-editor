/*
 * @Description: 缩放工具
 * @Author: ldx
 * @Date: 2023-12-21 11:28:43
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-10 09:56:05
 */
import { useClickAway } from 'ahooks'
import { InputNumber, Space } from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'


import EditorContext from '@/editor/context'

import { CheckOutlined } from '../../icons/check-outlined'
import { DownOutlined } from '../../icons/down-outlined'
import { LayoutEvent, ZoomEvent } from 'leafer-ui'
import { isWindows } from '@/editor/utils'
const ToolZoom = () => {
  const editor = useContext(EditorContext)
  const [open, setOpen] = useState(false)
  const [rulerVisible, setRulerVisible] = useState(true)
  const [zoom, setZoom] = useState(100)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tools, setTools] = useState<any[]>([])
  useClickAway(() => {
    setOpen(false)
  }, containerRef)

  useEffect(() => {
    if (!editor) return
    const zoomChange = () => {
      const zoom = typeof editor.app.tree.scale === 'number' ? Math.trunc(editor.app.tree.scale * 100) : 100
      setZoom(zoom)
    }
    editor.app.tree.on(LayoutEvent.AFTER, zoomChange)

    const tools = [
      {
        leftText: '放大',
        rightText: isWindows ? 'Ctrl+=' : '⌘+',
        name: 'zoomIn',
        // keyboard: 'ctrl+=',
        action: editor?.manager.keybord.hotkeys.zoomIn
      },
      {
        leftText: '缩小',
        rightText: isWindows ? 'Ctrl+-' : '⌘-',
        name: 'zoomOut',
        // keyboard: 'ctrl+-',
        action: editor?.manager.keybord.hotkeys.zoomOut
      },
      {
        leftText: '显示全部',
        rightText: isWindows ? 'Ctrl+1' : '⌘1',
        name: 'showAll',
        // keyboard: 'ctrl+1',
        action: editor?.manager.keybord.hotkeys.showAll
      },
      {
        leftText: '显示选中内容',
        rightText: isWindows ? 'Ctrl+2' : '⌘2',
        name: 'showSelectGraph',
        keyboard: 'ctrl+2',
        action: editor?.manager.keybord.hotkeys.showSelectGraph
      },
      {
        leftText: '50%',
        rightText: '',
        name: '50%',
        action: editor?.manager.keybord.hotkeys['50%']
      },
      {
        leftText: '100%',
        rightText: isWindows ? 'Ctrl+0' : '⌘0',
        name: '100%',
        keyboard: 'ctrl+0',
        action: editor?.manager.keybord.hotkeys['100%']
      },
      {
        leftText: '200%',
        rightText: '',
        name: '200%',
        action:editor?.manager.keybord.hotkeys['200%']
      },
    ]
    tools.forEach(tool => {
      if (!tool.keyboard) return
      editor.manager.keybord && editor.manager.keybord.register({
        keyboard: tool.keyboard,
        name: tool.name,
        action: tool.action
      })
    })
    setTools(tools)

    return () => {
      editor.app.tree.off(LayoutEvent.AFTER, zoomChange)
      tools.forEach(tool => {
        if (!tool.keyboard) return
        editor.manager.keybord && editor.manager.keybord.unRegister(tool.name)
      })
    }
  }, [editor])

  return (
    <div className="relative" ref={containerRef}>
      <Space
        className="cursor-pointer w-90px"
        onClick={() => {
          setOpen(!open)
        }}
      >
        <div className="text-#1890ff w-50px flex justify-end">{zoom}%</div>
        <DownOutlined className="mt-6px fill-#1890ff " />
      </Space>
      {open && (
        <div
          className="absolute z-999 bg-#fff rounded-4px border-1px border-#eee py-6px top-32px right-4px"
          style={{
            boxShadow: '0 0 0 1px rgba(0,0,0,.05), 0 4px 10px rgba(0,0,0,.1)'
          }}
        >
          <InputNumber
            size="small"
            min={1}
            max={25600}
            value={zoom}
            defaultValue={100}
            controls={false}
            className="w-130px mx-18px"
            onPressEnter={(event: any) => {
              if (!editor) return
              const value = event.target?.value
              if (value < 1 || value > 25600) return
              editor.app.tree.scale = value / 100
            }}
            onStep={(value) => {
              if (!editor) return
              setZoom(value)
              editor.app.tree.scale = value / 100
            }}
            onBlur={(event: any) => {
              if (!editor) return
              const value = event.target?.value
              if (value < 1 || value > 25600) return
              editor.app.tree.scale = value / 100
            }}
            suffix="%"
          />
          <div className="h-1px bg-#ddd my-6px"></div>
          {tools.map((tool) => {
            return (
              <div
                className="flex justify-between items-center text-12px  h-24px cursor-pointer hover:bg-#e1f2ff"
                key={tool.name}
                onClick={() => {
                  tool.action && tool.action()
                  setOpen(false)
                }}
              >
                <span className="flex justify-between items-center">
                  <span className="w-24px h-24px"></span>
                  <span>{tool.leftText}</span>
                </span>
                <span className="mr-24px">{tool.rightText}</span>
              </div>
            )
          })}
          <div className="h-1px bg-#ddd my-6px"></div>
          <div
            className="flex justify-between items-center text-12px h-24px cursor-pointer hover:bg-#e1f2ff"
            onClick={() => {
              if (!editor) return
              editor.ruler.visible = !rulerVisible
              setRulerVisible(!rulerVisible)
            }}
          >
            <span className="flex justify-between items-center">
              <div className="w-24px h-24px">
                {rulerVisible && <CheckOutlined />}
              </div>
              <span>标尺</span>
            </span>
            <span className="mr-24px">{isWindows ? 'Shift+R' : '⇧R'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolZoom
