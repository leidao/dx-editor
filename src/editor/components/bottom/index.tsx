/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 14:30:53
 */
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/editor/context'
import { MoveEvent } from 'leafer-ui'


const Bottom = () => {
  const editor = useContext(EditorContext)

  const [opacity, setOpacity] = useState(100)

  const change = (e)=>{
    console.log('e',e);
    
  }

  useEffect(() => {
    if (!editor) return

    
    editor.app.on(MoveEvent.MOVE, change)
    

    return () => {
      // editor.app.editor.off(EditorEvent.SELECT, change)
      
    }

  }, [editor])


  return (
    <div className="w-100% h-100%">
      
    </div>
  )
}
export default Bottom
