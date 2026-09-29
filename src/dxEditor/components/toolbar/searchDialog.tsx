import { Button, Input, Modal } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import { EditorEvent } from '@/dxEditor/event'

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
      {results.map((item, resultIndex) => <button type="button" key={item.uuid}
        className={`block w-100% text-left p-6px text-12px rounded-4px ${index === resultIndex ? 'bg-#e1f2ff' : 'hover:bg-#f2f2f2'}`}
        onClick={() => focus(resultIndex)}>{item.name}</button>)}
    </div>
  </Modal>
}

export default SearchDialog
