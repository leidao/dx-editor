import { Empty } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { Object2D } from '@/dxCanvas'
import EditorContext from '@/dxEditor/context'
import { EditorEvent } from '@/dxEditor/event'
import { HideOutlined, LockFilled, ShowOutlined, UnlockFilled } from './icons'

const Layer = () => {
  const editor = useContext(EditorContext)
  const [list, setList] = useState<Object2D[]>([])

  useEffect(() => {
    if (!editor) return
    const refresh = () => setList([...editor.tree.children])
    const events = [EditorEvent.ADD, EditorEvent.REMOVE, EditorEvent.UPDATE,
      EditorEvent.SELECT, EditorEvent.HISTORY_CHANGE]
    refresh()
    events.forEach(type => editor.addEventListener(type, refresh))
    return () => events.forEach(type => editor.removeEventListener(type, refresh))
  }, [editor])

  const change = (obj: Object2D, attr: 'visible' | 'locked') => {
    if (!editor) return
    obj[attr] = !obj[attr]
    if ((!obj.visible || obj.locked) && editor.selector.list.includes(obj)) editor.selector.cancel()
    editor.tree.render()
    editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update', { target: obj }))
  }

  return (
    <div className="h-100% overflow-auto">
      {list.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
        [...list].reverse().map(obj => (
          <div key={obj.uuid} className={`h-32px px-8px flex items-center gap-6px cursor-pointer ${editor?.selector.list.includes(obj) ? 'bg-#e1f2ff' : 'hover:bg-#f2f2f2'}`}
            onClick={() => { if (obj.visible && !obj.locked) editor?.selector.select(obj) }}>
            <span className={`flex-1 truncate ${obj.visible ? 'text-#333' : 'text-#999'}`}>{obj.name}</span>
            <button type="button" title={obj.locked ? '解锁' : '锁定'} aria-label={obj.locked ? '解锁' : '锁定'}
              onClick={event => { event.stopPropagation(); change(obj, 'locked') }}>
              {obj.locked ? <LockFilled /> : <UnlockFilled />}
            </button>
            <button type="button" title={obj.visible ? '隐藏' : '显示'} aria-label={obj.visible ? '隐藏' : '显示'}
              onClick={event => { event.stopPropagation(); change(obj, 'visible') }}>
              {obj.visible ? <ShowOutlined /> : <HideOutlined />}
            </button>
          </div>
        ))}
    </div>
  )
}

export default Layer
