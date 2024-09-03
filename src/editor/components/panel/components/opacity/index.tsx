

/*
 * @Description: 不透明度
 * @Author: ldx
 * @Date: 2024-08-31 14:52:09
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-03 14:54:11
 */
import { Slider } from "antd"
import NumberInput from "../numberInput"
import { useContext } from "react"
import EditorContext from "@/editor/context"
import { IUI } from "@leafer-ui/interface"
import './index.scss'
interface Props {
  opacity: number,
  selectList:IUI[]
}
const Opacity: React.FC<Props> = ({ opacity,selectList }) => {
  const view = useContext(EditorContext)
  return <div className="panel_opacity p-10px flex items-center ">
    <div className='w-58px text-12px text-#00000099'>不透明度</div>
    <div className='flex-1'>
      <Slider
        min={0}
        max={100}
        styles={{
          rail: {
            background: '#e6e7eb',
            height: '3px'
          },
          handle: {
            width: '11px',
            height: '11px',
            background: '#fff',
            borderRadius: '50%',
          },
          track: {
            background: `#0077ff`,
            height: '3px'

          },
        }}
        onChange={(value) => {
          if (!view) return
          selectList.map(item => {
            item.opacity = value / 100
          })
          view.app.editor.emit('opacityChange')
        }}
        onFocus={() => {
          if (!view) return
          view.app.editor.config.keyEvent = false
        }}
        onBlur={() => {
          if (!view) return
          view.app.editor.config.keyEvent = true
          view.app.tree.emit('update')
        }}
        tooltip={{ open: false }}
        value={typeof opacity === 'number' ? opacity : 0}
      />
    </div>
    <div >
      <NumberInput
        value={opacity}
        className='w-60px ml-10px'
        min={0}
        max={100}
        suffix='%'
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
          selectList.map(item => {
            item.opacity = value / 100
          })
          view.app.editor.emit('opacityChange')
        }}
      />
    </div>
  </div>
}
export default Opacity