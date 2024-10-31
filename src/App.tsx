/*
 * @Description: 电路图编辑器
 * @Author: ldx
 * @Date: 2024-08-20 14:33:49
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-24 13:50:34
 */

import { useEffect, useRef, useState } from 'react'

const preventDefaultScalePage = (event: WheelEvent) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
  }
}
import LeftPanel from '@/dxEditor/components/leftPanel'
import RightPanel from '@/dxEditor/components/rightPanel'
import ToolBar from '@/dxEditor/components/toolbar'
import EditorContext from '@/dxEditor/context'
import { EditorView } from '@/dxEditor'
const Home = () => {
  const [editor, setEditor] = useState<EditorView | null>(null)

  const container = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (!container.current) return
    const editor = new EditorView({ container: container.current })
    setEditor(editor)
    // 禁止页面放大
    document.addEventListener('wheel', preventDefaultScalePage, {
      capture: false,
      passive: false
    })
    return () => {
      editor?.destroy()
      document.removeEventListener('wheel', preventDefaultScalePage)
    }
  }, [])
  return (
    <EditorContext.Provider value={editor}>
      <div className='h-70px border-b-1 box-border border-#e6e6e6 border-b-solid px-10px'>
        <ToolBar className="text-#202020"></ToolBar>
      </div>
      <div className="flex w-100% overflow-hidden box-border" style={{
        height: 'calc(100% - 70px)'
      }}>
        <div className='w-240px h-100% bg-#fafafa border-r-solid border-r-1px border-#dadadc99'>
          <LeftPanel></LeftPanel>
        </div>
        <div className="flex-1 relative h-100% overflow-hidden">
          <div
            className="absolute left-0px w-100% h-100% bg-#fff"
            ref={container}
          >
          </div>
          {/* <div className='absolute left-0px bottom-0px w-100% h-20px bg-#b0aeae45'></div> */}
        </div>
        <div className="w-280px h-100% bg-#fafafa border-l-solid border-l-1px border-#dadadc99">
          <RightPanel></RightPanel>
        </div>
      </div>
    </EditorContext.Provider>
  )
}
export default Home
