import { Empty, List } from 'antd'
import VirtualList from 'rc-virtual-list'
import { useContext, useEffect, useState } from 'react'

// import { HoverHelper, Object2D, SelectHelper } from '@/dxCanvas'
import EditorContext from '@/editor/context'

import { HideOutlined, LockFilled, ShowOutlined, UnlockFilled } from './icons'
import { ChildEvent, RenderEvent } from 'leafer-ui'
import { IUI } from '@leafer-ui/interface'
const Layer = () => {
  const editor = useContext(EditorContext)
  const [list, setList] = useState<IUI[]>([])
  const [selectId, setSetlectId] = useState<number>()
  const [hoverId, setHoverId] = useState<number>()
  const [, forceUpdate] = useState<object>()
  useEffect(() => {
    if (!editor) return
    const change = () => {
      const list = editor.app.tree.children || []
      setList(list.slice())
    }
    editor.app.tree.on(RenderEvent.END, change)
    // editor.app.editor.on(ChildEvent.REMOVE, change)
    return () => {
      editor.app.tree.off(RenderEvent.END, change)
      // editor.app.editor.off(ChildEvent.REMOVE, change)
    }
  }, [editor])

  return (
    <div className="w-240px h-100%">
      {list.length === 0 ? (
        <div className="w-100% h-100% flex justify-center items-center">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <div className="overflow-auto h-100%" id="list-wrap">
          <List>
            <VirtualList
              data={list}
              height={1000}
              itemHeight={32}
              itemKey="innerId"
            >
              {(obj: IUI) => (
                <div
                  key={obj.innerId}
                  className="relative  border-1px  box-border border-solid"
                  onMouseEnter={() => {
                    setHoverId(obj.innerId)
                    if (!editor) return
                    editor.app.editor.hoverTarget = obj
                  }}
                  onMouseLeave={() => {
                    setHoverId(undefined)
                    if (!editor) return
                    editor.app.editor.hoverTarget = undefined
                  }}
                  style={{
                    borderColor:
                      hoverId === obj.innerId ? '#0f8fff' : 'transparent',
                    background: selectId === obj.innerId
                      ? '#e1f2ff'
                      : '#fff'
                  }}
                >
                  <div
                    className="h-32px px-24px flex justify-between items-center cursor-pointer"
                    onClick={() => {
                      setSetlectId(obj.innerId)
                      if (!editor) return
                      editor.app.editor.select(obj)
                    }}
                  >
                    <span
                      style={{ color: !obj.visible ? '#0000004d' : '#333' }}
                    >
                      {obj.name}
                    </span>
                  </div>
                  <span className="flex items-center absolute top-5px right-18px">
                    <span
                      className="w-22px h-22px rounded-4px mr-2px hover:bg-#dcdcdc flex items-center justify-center"
                      style={{
                        opacity:
                          hoverId === obj.innerId || obj.locked ? 1 : 0
                      }}
                      onClick={() => {
                        obj.locked = !obj.locked
                        forceUpdate({})
                      }}
                    >
                      {obj.locked ? <LockFilled /> : <UnlockFilled />}
                    </span>
                    <span
                      className="w-22px h-22px rounded-4px hover:bg-#dcdcdc flex items-center justify-center"
                      style={{
                        opacity: hoverId === obj.innerId || !obj.visible ? 1 : 0
                      }}
                      onClick={() => {
                        obj.visible = !obj.visible
                        forceUpdate({})
                      }}
                    >
                      {obj.visible ? <ShowOutlined /> : <HideOutlined />}
                    </span>
                  </span>
                </div>
              )}
            </VirtualList>
          </List>
        </div>
      )}
    </div>
  )
}

export default Layer
