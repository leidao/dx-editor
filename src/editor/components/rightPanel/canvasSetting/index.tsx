/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 16:17:08
 */
import { Collapse, Empty, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/editor/context'
import { IUI } from '@leafer-ui/interface'
import { EditorEvent, EditorMoveEvent, EditorRotateEvent, EditorScaleEvent } from 'leafer-editor'
import _ from 'lodash'


const CanvasSettings = () => {
  const editor = useContext(EditorContext)
  const [selectList, setSelectList] = useState<(IUI[])>([])


  useEffect(() => {
    if (!editor) return

    
    // editor.app.editor.on(EditorEvent.SELECT, change)
    

    return () => {
      // editor.app.editor.off(EditorEvent.SELECT, change)
      // editor.app.editor.off(EditorMoveEvent.MOVE, change)
     
    }

  }, [editor])


  return (
    <div className="w-100% h-100%">
      
    </div>
  )
}
export default CanvasSettings
