import { Empty, Input } from 'antd'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Group, Object2D } from '@/dxCanvas'
import EditorContext from '@/dxEditor/context'
import { EditorEvent } from '@/dxEditor/event'
import { HideOutlined, LockFilled, ShowOutlined, UnlockFilled } from './icons'

const Layer = () => {
  const editor = useContext(EditorContext)
  const [list, setList] = useState<Object2D[]>([])
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [renaming, setRenaming] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [dragged, setDragged] = useState<Object2D | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!editor) return
    const refresh = () => setList([...editor.tree.children])
    const events = [EditorEvent.ADD, EditorEvent.REMOVE, EditorEvent.UPDATE,
      EditorEvent.SELECT, EditorEvent.HISTORY_CHANGE]
    refresh()
    events.forEach(type => editor.addEventListener(type, refresh))
    return () => events.forEach(type => editor.removeEventListener(type, refresh))
  }, [editor])

  const groupIds = useMemo(() => {
    const ids: string[] = []
    const visit = (objects: Object2D[]) => objects.forEach(obj => {
      if (obj instanceof Group) { ids.push(obj.uuid); visit(obj.children) }
    })
    visit(list)
    return ids
  }, [list])
  const visibleIds = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    if (!term) return null
    const ids = new Set<string>()
    const visit = (obj: Object2D): boolean => {
      let childMatches = false
      if (obj instanceof Group) for (const child of obj.children) if (visit(child)) childMatches = true
      const matches = obj.name.toLocaleLowerCase().includes(term) || childMatches
      if (matches) ids.add(obj.uuid)
      return matches
    }
    list.forEach(visit)
    return ids
  }, [list, query])

  const change = (obj: Object2D, attr: 'visible' | 'locked') => {
    if (!editor) return
    obj[attr] = !obj[attr]
    if ((!obj.visible || obj.locked) && editor.selector.list.includes(obj)) editor.selector.cancel()
    editor.tree.render()
    editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update', { target: obj }))
  }

  const canSelect = (obj: Object2D) => {
    let current: Object2D | undefined = obj
    while (current && current !== editor?.tree) {
      if (!current.visible || current.locked) return false
      current = current.parent
    }
    return true
  }

  const commitName = (obj: Object2D, value: string) => {
    setRenaming(null)
    const next = value.trim()
    if (!editor || !next || next === obj.name) return
    obj.name = next
    editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update', { target: obj }))
  }

  const moveBefore = (target: Object2D) => {
    const source = dragged
    setDragged(null)
    if (!editor || !source || source === target || source.parent !== target.parent || !target.parent) return
    const siblings = target.parent.children
    siblings.splice(siblings.indexOf(source), 1)
    siblings.splice(siblings.indexOf(target) + 1, 0, source)
    siblings.forEach((item, index) => { item.index = index })
    editor.tree.render()
    editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update', { target: source }))
  }

  const renderRows = (objects: Object2D[], depth = 0): React.ReactNode =>
    [...objects].reverse().filter(obj => !visibleIds || visibleIds.has(obj.uuid)).map(obj => <div key={obj.uuid}>
      <div className={`h-32px pr-8px flex items-center gap-6px cursor-pointer ${editor?.selector.list.includes(obj) ? 'bg-#e1f2ff' : 'hover:bg-#f2f2f2'}`}
        style={{ paddingLeft: 8 + depth * 14 }} draggable role="treeitem" tabIndex={0}
        aria-level={depth + 1} aria-selected={!!editor?.selector.list.includes(obj)}
        aria-expanded={obj instanceof Group ? !!visibleIds || !collapsed.has(obj.uuid) : undefined}
        onDragStart={event => { event.stopPropagation(); setDragged(obj); event.dataTransfer.effectAllowed = 'move' }}
        onDragEnd={() => setDragged(null)}
        onDragOver={event => { if (dragged?.parent === obj.parent) event.preventDefault() }}
        onDrop={event => { event.preventDefault(); event.stopPropagation(); moveBefore(obj) }}
        onClick={() => { if (canSelect(obj)) editor?.selector.select(obj) }}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (canSelect(obj)) editor?.selector.select(obj)
          }
          if (obj instanceof Group && !visibleIds && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault()
            setCollapsed(previous => {
              const next = new Set(previous)
              event.key === 'ArrowLeft' ? next.add(obj.uuid) : next.delete(obj.uuid)
              return next
            })
          }
        }}
        onDoubleClick={event => { event.stopPropagation(); setRenaming(obj.uuid); setName(obj.name) }}>
        {obj instanceof Group ? <button type="button" disabled={!!visibleIds} className="w-12px text-10px" aria-label={collapsed.has(obj.uuid) && !visibleIds ? '展开' : '折叠'}
          onClick={event => {
            event.stopPropagation()
            setCollapsed(previous => {
              const next = new Set(previous)
              next.has(obj.uuid) ? next.delete(obj.uuid) : next.add(obj.uuid)
              return next
            })
          }}>{collapsed.has(obj.uuid) && !visibleIds ? '▶' : '▼'}</button> : <span className="w-12px" />}
        {renaming === obj.uuid ? <input autoFocus className="flex-1 min-w-0 text-12px" value={name}
          onChange={event => setName(event.target.value)} onBlur={event => commitName(obj, event.currentTarget.value)}
          onClick={event => event.stopPropagation()}
          onKeyDown={event => {
            if (event.key === 'Enter') event.currentTarget.blur()
            if (event.key === 'Escape') { event.currentTarget.value = obj.name; setRenaming(null); event.currentTarget.blur() }
          }} /> : <span className={`flex-1 truncate ${obj.visible ? 'text-#333' : 'text-#999'}`}>{obj.name}</span>}
        <button type="button" title={obj.locked ? '解锁' : '锁定'} aria-label={obj.locked ? '解锁' : '锁定'}
          onClick={event => { event.stopPropagation(); change(obj, 'locked') }}>
          {obj.locked ? <LockFilled /> : <UnlockFilled />}
        </button>
        <button type="button" title={obj.visible ? '隐藏' : '显示'} aria-label={obj.visible ? '隐藏' : '显示'}
          onClick={event => { event.stopPropagation(); change(obj, 'visible') }}>
          {obj.visible ? <ShowOutlined /> : <HideOutlined />}
        </button>
      </div>
      {obj instanceof Group && (visibleIds || !collapsed.has(obj.uuid)) && renderRows(obj.children, depth + 1)}
    </div>)

  return <div className="h-100% flex flex-col">
    <div className="px-6px py-4px flex items-center gap-4px">
      <Input size="small" placeholder="筛选图层" aria-label="筛选图层" value={query}
        onChange={event => setQuery(event.target.value)} allowClear />
      <button type="button" disabled={!!visibleIds} className="text-12px shrink-0" onClick={() => setCollapsed(new Set(groupIds))}>折叠</button>
      <button type="button" disabled={!!visibleIds} className="text-12px shrink-0" onClick={() => setCollapsed(new Set())}>展开</button>
    </div>
    <div className="flex-1 overflow-auto" role="tree" aria-label="图层">
      {list.length === 0 || (visibleIds && visibleIds.size === 0)
        ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : renderRows(list)}
    </div>
  </div>
}

export default Layer
