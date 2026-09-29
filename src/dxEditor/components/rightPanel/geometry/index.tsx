import { Collapse } from 'antd'
import { useContext, useState } from 'react'
import { Img, Rect } from '@/dxCanvas'
import EditorContext from '@/dxEditor/context'
import { EditorEvent } from '@/dxEditor/event'
import NumberInput from '../components/numberInput'

type Graphic = Img | Rect
type Field = 'x' | 'y' | 'width' | 'height'

const dimension = (item: Graphic, field: Field) => {
  if (field === 'x' || field === 'y') return item.position[field]
  return item instanceof Img ? (field === 'width' ? item.size.x : item.size.y) : item[field]
}

const GeometrySetting = ({ selectList, title }: { selectList: Graphic[]; title: string }) => {
  const editor = useContext(EditorContext)
  const [, refresh] = useState(0)
  const change = (field: Field, value: number) => {
    if (!editor || !Number.isFinite(value)) return
    if ((field === 'width' || field === 'height') && value < 1) return
    if (selectList.every(item => dimension(item, field) === value)) return
    selectList.forEach(item => {
      if (field === 'x' || field === 'y') item.position[field] = value
      else if (item instanceof Img) {
        if (item.userData.ellipseData && !item.userData.portSize) item.userData.portSize = item.size.toArray()
        item.size[field === 'width' ? 'x' : 'y'] = value
      }
      else item[field] = value
      item.computeBoundsBox(true)
    })
    refresh(value => value + 1)
    editor.tree.render()
    editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }

  return <Collapse defaultActiveKey={[title]} ghost expandIconPosition="end" items={[{
    key: title, label: title,
    children: <div className="pt-10px">
      {(['x', 'y', 'width', 'height'] as Field[]).map(field => {
        const values = selectList.map(item => dimension(item, field))
        const value = values.every(item => item === values[0]) ? values[0] : undefined
        const label = { x: 'X', y: 'Y', width: '宽度', height: '高度' }[field]
        return <div key={field} className="flex items-center mb-10px">
          <span className="w-60px text-12px text-#00000099">{label}</span>
          <NumberInput className="w-180px" value={value} placeholder="混合"
            min={field === 'width' || field === 'height' ? 1 : undefined}
            onChange={next => change(field, Number(next))} />
        </div>
      })}
    </div>
  }]} />
}

export default GeometrySetting
