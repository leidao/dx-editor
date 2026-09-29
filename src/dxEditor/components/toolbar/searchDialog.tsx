import { Button, Input, Modal } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import { EditorEvent } from '@/dxEditor/event'
import type { Object2D } from '@/dxCanvas'

const SearchDialog = () => {
  const editor = useContext(EditorContext)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(-1)
  const [, refresh] = useState(0)
  useEffect(() => {
    if (!editor) return
    const show = () => setOpen(true)
    const update = () => refresh(value => value + 1)
    editor.addEventListener(EditorEvent.FIND, show)
    editor.addEventListener(EditorEvent.UPDATE, update)
    editor.addEventListener(EditorEvent.ADD, update)
    editor.addEventListener(EditorEvent.REMOVE, update)
    return () => {
      editor.removeEventListener(EditorEvent.FIND, show)
      editor.removeEventListener(EditorEvent.UPDATE, update)
      editor.removeEventListener(EditorEvent.ADD, update)
      editor.removeEventListener(EditorEvent.REMOVE, update)
    }
  }, [editor])
  const results = editor?.findAll(query) || []
  const describe = (item: Object2D) => {
    const ancestors: string[] = []
    let parent = item.parent
    while (parent && parent !== editor?.tree) {
      ancestors.unshift(parent.name)
      parent = parent.parent
    }
    const { min, max } = item.bounds
    const x = Math.round((min.x + max.x) / 2)
    const y = Math.round((min.y + max.y) / 2)
    return { path: ancestors.join(' / ') || '画布', location: Number.isFinite(x) && Number.isFinite(y) ? `X ${x} · Y ${y}` : '' }
  }
  const focus = (next: number) => {
    if (!editor || results.length === 0) return
    const resolved = ((next % results.length) + results.length) % results.length
    setIndex(resolved)
    editor.focusObject(results[resolved])
  }
  return <Modal title="查找图元" open={open} onCancel={() => setOpen(false)} footer={null} width={420} destroyOnClose>
    <Input autoFocus placeholder="输入图元名称或文本" value={query} onChange={event => { setQuery(event.target.value); setIndex(-1) }}
      onPressEnter={() => focus(index + 1)} />
    <div className="flex items-center gap-8px mt-10px mb-8px text-12px">
      <span className="flex-1">{query ? `${results.length} 个结果` : '输入关键词开始查找'}</span>
      <Button size="small" disabled={!results.length} onClick={() => focus(index < 0 ? results.length - 1 : index - 1)}>上一个</Button>
      <Button size="small" disabled={!results.length} onClick={() => focus(index + 1)}>下一个</Button>
    </div>
    <div className="max-h-240px overflow-auto">
      {results.map((item, resultIndex) => {
        const { path, location } = describe(item)
        return <button type="button" key={item.uuid} aria-current={index === resultIndex ? 'true' : undefined}
          aria-label={`第 ${resultIndex + 1} 个结果：${item.name}，${path}，${location}`}
          className={`block w-100% text-left p-6px text-12px rounded-4px ${index === resultIndex ? 'bg-#e1f2ff' : 'hover:bg-#f2f2f2'}`}
          onClick={() => focus(resultIndex)}>
          <span className="block">{resultIndex + 1}. {item.name}</span>
          <span className="block text-10px text-#777">{path} · {location}</span>
        </button>
      })}
    </div>
  </Modal>
}

export default SearchDialog
