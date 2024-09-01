/*
 * @Description: 工具按钮
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-31 16:51:54
 */

import { Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'
import ToolDrawLine from '@/editor/manager/tools/drawLine'
import ToolOperationGraph from '@/editor/manager/tools/operationGraph'
import ToolDragCanvas from '@/editor/manager/tools/dragCanvas'
import ToolDrawText from '@/editor/manager/tools/drawText'
import { HandOutlined, LineOutlined, SelectOutlined, TextFilled } from './icons'
import { InnerEditorEvent } from 'leafer-editor'
const ToolBtn = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const view = useContext(EditorContext)

  useEffect(() => {
    if (!view) return
    const tools = [
      {
        instance: new ToolOperationGraph(view),
        name: 'operationGraph',
        keyboard: 'a',
        tip: '选择 A',
        icon: <SelectOutlined />
      },
      {
        instance: new ToolDrawLine(view),
        name: 'drawLine',
        keyboard: 'l',
        tip: '绘制线段 L',
        icon: <LineOutlined />
      },
      {
        instance: new ToolDrawText(view),
        name: 'drawText',
        keyboard: 't',
        tip: '绘制文字 T',
        icon: <TextFilled />
      },
      {
        instance: new ToolDragCanvas(view),
        name: 'dragCanvas',
        keyboard: 'h',
        tip: '拖拽画布 H',
        icon: <HandOutlined />
      },
    ]
    tools.forEach(tool => {
      view.manager.tools.register(tool.instance)
      view.manager.keybord.register({
        keyboard: tool.keyboard,
        name: tool.name,
        action: (event) => {
          !tool.instance.enableSwitchTool && setActive(tool.name)
        }
      })
    })
    // 手动给tools工具函数赋值切换选中toolbar能力
    view.manager.tools.setSelectedName = setSelectedName
    setActive('operationGraph')
    setTools(tools)

    return () => {
      tools.forEach(tool => {
        if (!tool.keyboard) return
        view.manager.tools.unRegister(tool.name)
        view.manager.keybord.unRegister(tool.name)
      })
    }
  }, [view])

  const styleFn = (value: string) => {
    return {
      background: selectedName === value ? '#1890ff' : '',
      color: selectedName === value ? '#fff' : '#000'
    }
  }
  const setActive = (toolName: string) => {
    if (!view) return
    setSelectedName(toolName)
    view.manager.tools.setActiveTool(toolName)
  }
  return (
    <div className="flex-1 flex items-center ">
      {
        tools.map(tool => 
          <div
            key={tool.name}
            className="cursor-pointer w-32px h-32px hover:bg-#f2f2f2  rounded-6px flex justify-center items-center ml-10px"
            style={styleFn(tool.name)}
            onClick={() => setActive(tool.name)}
          >
            <Tooltip placement="bottom" title={tool.tip} arrow={false}>
              <span className="flex justify-center items-center">
                {tool.icon}
              </span>
            </Tooltip>
          </div>
       )
      }


    </div>
  )
}

export default ToolBtn
