import './index.scss'
import { IUI } from "@leafer-ui/interface"
import { Checkbox, Collapse, Radio, Tooltip } from "antd"
import { BrAetAll, BrSetSeparately } from "./icons"
import NumberInput from '../numberInput'
import { useContext, useState } from 'react'
import EditorContext from '@/editor/context'
import Color from '../color'

interface Props {
  selectList: IUI[]
}
const Appearance: React.FC<Props> = ({ selectList }) => {
  const [cornerRadiusType, setCornerRadiusType] = useState('1')

  const [cornerRadius, setCornerRadius] = useState([0, 0, 0, 0])

  const view = useContext(EditorContext)

  return <div className='panel_appearance'>
    <Collapse defaultActiveKey={['外观']} ghost expandIconPosition='end' items={[
      {
        key: '外观',
        label: '外观',
        children: (
          <div>
            <div className="mb-10px flex items-center">
              <div>
                <Radio.Group value={cornerRadiusType} size='small'
                  onChange={(e) => {
                    setCornerRadiusType(e.target.value)
                  }}
                >
                  <Tooltip placement="bottom" title='圆角' arrow={false}>
                    <Radio.Button value="1"><BrAetAll /></Radio.Button>
                  </Tooltip>
                  <Tooltip placement="bottom" title='独立圆角' arrow={false}>
                    <Radio.Button value="2"><BrSetSeparately /></Radio.Button>
                  </Tooltip>

                </Radio.Group>
              </div>
              <div className='ml-14px flex items-center rounded_group'>
                <NumberInput
                  className="w-46px"
                  style={{ borderRounds: cornerRadiusType === '2' ? '4px' : '4px 0px 0px 4px' }}
                  value={cornerRadius[0]}
                  min={0}
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

                  }}
                />
                {cornerRadiusType === '2' && <>
                  <NumberInput
                    className="w-46px rounded-0px"
                    value={cornerRadius[1]}
                    min={0}
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

                    }}
                  />
                  <NumberInput
                    className="w-46px rounded-0px"
                    value={cornerRadius[2]}
                    min={0}
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

                    }}
                  />
                  <NumberInput
                    className="w-46px rounded-l-0px"
                    value={cornerRadius[3]}
                    min={0}
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

                    }}
                  /></>}
              </div>
            </div>
            <div className='mb-10px flex items-center'>
              <div className='text-12px text-#00000099 mr-14px'>填充</div>
              <div className='ml-14px'><Color></Color></div>
            </div>
            <div className='mb-10px flex items-center'>
              <div className='text-12px text-#00000099 mr-14px'>描边</div>
              <div className='ml-14px'><Color></Color></div>
            </div>
            {/* <div className='mb-10px flex items-center'>
              <div className='text-12px text-#00000099 mr-14px'>阴影</div>
              <div><Checkbox onChange={() => { }} /></div>
              <div className='ml-14px'><Color></Color></div>
            </div> */}
          </div>
        ),
      }
    ]} />
  </div>

}

export default Appearance