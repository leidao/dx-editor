import { Checkbox, Collapse } from 'antd'
import { useContext, useState } from 'react'
import { degToRad, Ellipse, Img, radToDeg, Rect } from '@/dxCanvas'
import EditorContext from '@/dxEditor/context'
import { EditorEvent } from '@/dxEditor/event'
import NumberInput from '../components/numberInput'

type Graphic = Img | Rect | Ellipse
type Field = 'x' | 'y' | 'width' | 'height' | 'rotation'

const dimension = (item: Graphic, field: Field) => {
  if (field === 'x' || field === 'y') return item.position[field]
  if (field === 'rotation') return Math.round(radToDeg(item.rotate) * 100) / 100
  return item instanceof Img ? (field === 'width' ? item.size.x : item.size.y) : item[field]
}

const GeometrySetting = ({ selectList, title }: { selectList: Graphic[]; title: string }) => {
  const editor = useContext(EditorContext)
  const [, refresh] = useState(0)
  const [lockRatio, setLockRatio] = useState(false)
  const change = (field: Field, value: number) => {
    if (!editor || !Number.isFinite(value)) return
    if ((field === 'width' || field === 'height') && value < 1) return
    if (selectList.every(item => dimension(item, field) === value)) return
    selectList.forEach(item => {
      if (field === 'x' || field === 'y') item.position[field] = value
      else if (field === 'rotation') item.rotate = degToRad(value)
      else {
        const previousWidth = dimension(item, 'width')
        const previousHeight = dimension(item, 'height')
        if (item instanceof Img) {
          if (item.userData.ellipseData && !item.userData.portSize) item.userData.portSize = item.size.toArray()
          item.size[field === 'width' ? 'x' : 'y'] = value
          if (lockRatio && previousWidth > 0 && previousHeight > 0) {
            item.size[field === 'width' ? 'y' : 'x'] = value * (field === 'width' ? previousHeight / previousWidth : previousWidth / previousHeight)
          }
        } else {
          item[field] = value
          if (lockRatio && previousWidth > 0 && previousHeight > 0) {
            item[field === 'width' ? 'height' : 'width'] = value * (field === 'width' ? previousHeight / previousWidth : previousWidth / previousHeight)
          }
        }
      }
      item.computeBoundsBox(true)
    })
    refresh(value => value + 1)
    editor.tree.render()
    editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }

  return <Collapse defaultActiveKey={[title]} ghost expandIconPosition="end" items={[{
    key: title, label: title,
    children: <div className="pt-10px">
      {(['x', 'y', 'width', 'height', 'rotation'] as Field[]).map(field => {
        const values = selectList.map(item => dimension(item, field))
        const value = values.every(item => item === values[0]) ? values[0] : undefined
        const label = { x: 'X', y: 'Y', width: '宽度', height: '高度', rotation: '旋转°' }[field]
        return <div key={field} className="flex items-center mb-10px">
          <span className="w-60px text-12px text-#00000099">{label}</span>
          <NumberInput className="w-180px" value={value} placeholder="混合"
            min={field === 'width' || field === 'height' ? 1 : undefined}
            onChange={next => change(field, Number(next))} />
        </div>
      })}
      <Checkbox checked={lockRatio} onChange={event => setLockRatio(event.target.checked)}>保持宽高比</Checkbox>
    </div>
  }]} />
}

export default GeometrySetting
