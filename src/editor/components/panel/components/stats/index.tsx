/*
 * @Description: 属性栏
 * @Author: ldx
 * @Date: 2024-08-30 19:41:38
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-01 16:56:45
 */

import EditorContext from "@/editor/context"
import { useContext, useState } from "react"
import NumberInput from "../numberInput"
import { IUI } from "@leafer-ui/interface"
import _ from "lodash"
import { Attr } from '@/editor/components/panel/index'
import { Rotation, Unlock, Lock } from '../../icons'
import { Tooltip } from "antd"
interface Props {
  selectList: IUI[]
  attr: Attr
}
const Stats: React.FC<Props> = ({ selectList, attr }) => {
  const view = useContext(EditorContext)
  const [lockRatio, setLockRatio] = useState(true)
  return <div >
    <div className='px-10px py-5px flex items-center justify-between'>
      <NumberInput
        className="w-80px"
        value={attr.x}
        prefix="X"
        placeholder='多个值'
        onFocus={() => {
          if (!view) return
          view.app.editor.config.keyEvent = false
        }}
        onBlur={() => {
          if (!view) return
          view.app.editor.config.keyEvent = true
          view.app.tree.emit('update')
        }}
        onChange={(value) => {
          if (!view) return
          const { element } = view.app.editor
          view.app.editor.element && view.app.editor.move(value - (element?.x || 0), 0)
        }}
      />
      <NumberInput
        className="w-80px"
        value={attr.y}
        prefix="Y"
        placeholder='多个值'
        onFocus={() => {
          if (!view) return
          view.app.editor.config.keyEvent = false
        }}
        onBlur={() => {
          if (!view) return
          view.app.editor.config.keyEvent = true
          view.app.tree.emit('update')
        }}
        onChange={(value) => {
          if (!view) return
          const { element } = view.app.editor
          view.app.editor.element && view.app.editor.move(0, value - (element?.y || 0))
        }}
      />
      <NumberInput
        className="w-80px"
        value={attr.rotation}
        prefix={<Rotation />}
        placeholder='多个值'
        onFocus={() => {
          if (!view) return
          view.app.editor.config.keyEvent = false
        }}
        onBlur={() => {
          if (!view) return
          view.app.editor.config.keyEvent = true
          view.app.tree.emit('update')
        }}
        onChange={(value) => {
          if (!view) return
          const { element } = view.app.editor
          view.app.editor.element && view.app.editor.rotateOf('center', value - (element?.rotation || 0))
        }}
      />
    </div>
    <div className='px-10px py-5px flex items-center justify-between'>
      <NumberInput
        value={attr.width}
        className="w-80px"
        prefix="W"
        placeholder='多个值'
        onFocus={() => {
          if (!view) return
          view.app.editor.config.keyEvent = false
        }}
        onBlur={() => {
          if (!view) return
          view.app.editor.config.keyEvent = true
          view.app.tree.emit('update')
        }}
        onChange={(value) => {
          if (!view) return
          const { element } = view.app.editor
          // 想缩放到指定 scale， 需除以元素的 scale，如下：
          const scale = value / (element?.width || 1)
          const lockRatio = view.app.editor.config.lockRatio
          view.app.editor.element && view.app.editor.scaleOf('top-left', scale, lockRatio ? scale : 1)
        }}
      />
      <NumberInput
        value={attr.height}
        className="w-80px"
        prefix="H"
        placeholder='多个值'
        onFocus={() => {
          if (!view) return
          view.app.editor.config.keyEvent = false
        }}
        onBlur={() => {
          if (!view) return
          view.app.editor.config.keyEvent = true
          view.app.tree.emit('update')
        }}
        onChange={(value) => {
          if (!view) return
          const { element } = view.app.editor
          const scale = value / (element?.height || 1)
          const lockRatio = view.app.editor.config.lockRatio
          view.app.editor.element && view.app.editor.scaleOf('top-left', lockRatio ? scale : 1, scale)
        }}
      />
      <div className="w-80px">
        <div
          className="cursor-pointer hover:bg-#f2f2f2 rounded-6px ml-6px w-28px h-28px flex items-center justify-center"
          onClick={() => {
            if (!view) return
            const lockRatio = view.app.editor.config.lockRatio
            view.app.editor.config.lockRatio = !lockRatio
            setLockRatio(!lockRatio)
          }}
        >
          <Tooltip placement="bottom" title='锁定宽高比' arrow={false}>
            <span className="flex justify-center items-center">
              {lockRatio ? <Lock /> : <Unlock />}
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
}

export default Stats