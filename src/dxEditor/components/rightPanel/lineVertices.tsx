import { Button } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { Line, Vector2 } from '@/dxCanvas'
import EditorContext from '@/dxEditor/context'
import { EditorEvent } from '@/dxEditor/event'
import NumberInput from './components/numberInput'

const LineVertices = ({ selectList }: { selectList: Line[] }) => {
  const editor = useContext(EditorContext)
  const [, refresh] = useState(0)
  useEffect(() => {
    if (!editor) return
    const update = () => refresh(value => value + 1)
    editor.addEventListener(EditorEvent.UPDATE, update)
    editor.addEventListener(EditorEvent.DRAG, update)
    return () => {
      editor.removeEventListener(EditorEvent.UPDATE, update)
      editor.removeEventListener(EditorEvent.DRAG, update)
    }
  }, [editor])
  const line = selectList.length === 1 ? selectList[0] : null
  if (!line || !editor) return null
  const points = line.getPoints()
  return <div className="px-10px pb-10px">
    <div className="text-12px text-#666 mb-8px">折点（画布中可直接拖动；移动关联端点会解除关联）</div>
    {points.map((point, index) => {
      const world = new Vector2(...point).applyMatrix3(line.worldMatrix)
      const connection = index === 0 ? line.userData.connections?.start :
        index === points.length - 1 ? line.userData.connections?.end : null
      return <div key={index} className="flex items-center gap-4px mb-6px">
        <span className="w-36px text-12px">{index + 1}{connection ? '●' : ''}</span>
        <NumberInput className="w-65px" value={world.x} onChange={value => editor.vertexEditor.changeCoordinate(index, 'x', Number(value))} />
        <NumberInput className="w-65px" value={world.y} onChange={value => editor.vertexEditor.changeCoordinate(index, 'y', Number(value))} />
        {index < points.length - 1 && <Button size="small" title="在后面插入折点" onClick={() => editor.vertexEditor.insertAfter(index)}>+</Button>}
        {index > 0 && index < points.length - 1 && <Button size="small" title="删除折点" onClick={() => editor.vertexEditor.remove(index)}>−</Button>}
      </div>
    })}
  </div>
}

export default LineVertices
