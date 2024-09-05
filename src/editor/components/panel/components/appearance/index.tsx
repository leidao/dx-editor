import './index.scss'
import { IUI } from "@leafer-ui/interface"
import { Checkbox, Collapse, Radio, Tooltip } from "antd"
import { BrAetAll, BrSetSeparately } from "./icons"
import NumberInput from '../numberInput'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/editor/context'
import ColorPicker from '../color/index'
import image from '@/editor/components/panel/components/color/images/bg2.png'

interface Props {
  selectList: IUI[]
}
const Appearance: React.FC<Props> = ({ selectList }) => {
  const [cornerRadiusType, setCornerRadiusType] = useState('1')

  const [cornerRadius, setCornerRadius] = useState([0, 0, 0, 0])

  const [fillData, setFillData] = useState<any>({
    color: '#d9d9d9',
    type: 'solid',
    url: '',
    bgUrl: image,
    mode: 'cover'
  })
  const [strokeData, setStrokeData] = useState<any>({
    color: '#ffffff',
    type: 'solid',
    url: '',
    bgUrl: image,
    mode: 'cover'
  })

  useEffect(() => {
    if (selectList.length === 0) return
    const item = selectList[0]
    if (item) {
      // console.log('item', item);
      const cornerRadius = item.cornerRadius
      setCornerRadius(cornerRadius !== undefined ? (Array.isArray(cornerRadius) ? cornerRadius : [+cornerRadius, +cornerRadius, +cornerRadius, +cornerRadius]) : [0, 0, 0, 0])
      const fill = item.fill || {}
      setFillData({
        bgUrl: image,
        type: 'solid',
        mode: 'cover',
        ...fill,
      })
      const stroke = item.stroke || {}
      setStrokeData({
        bgUrl: image,
        type: 'solid',
        mode: 'cover',
        ...stroke,
      })
    }
  }, [selectList])

  const view = useContext(EditorContext)

  type Attr = 'cornerRadius' | 'fill' | 'stroke'
  const changeAttr = (attr: Attr, value: any) => {
    selectList.forEach(item => {
      item[attr] = value
    })
  }

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
                  onChange={(e:any) => {
                    setCornerRadiusType(e.target.value)
                    const radius = [cornerRadius[0], cornerRadius[0], cornerRadius[0], cornerRadius[0]]
                    changeAttr('cornerRadius', radius)
                    setCornerRadius(radius)
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
                    const radius = cornerRadiusType === '1' ? [value, value, value, value] : [value, cornerRadius[1], cornerRadius[2], cornerRadius[3]]
                    changeAttr('cornerRadius', radius)
                    setCornerRadius(radius)
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
                      const radius = [cornerRadius[0], value, cornerRadius[2], cornerRadius[3]]
                      changeAttr('cornerRadius', radius)
                      setCornerRadius(radius)
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
                      const radius = [cornerRadius[0], cornerRadius[1], value, cornerRadius[3]]
                      changeAttr('cornerRadius', radius)
                      setCornerRadius(radius)
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
                      const radius = [cornerRadius[0], cornerRadius[1], cornerRadius[2], value]
                      changeAttr('cornerRadius', radius)
                      setCornerRadius(radius)
                    }}
                  /></>}
              </div>
            </div>
            <div className='mb-10px flex items-center'>
              <div className='text-12px text-#00000099 mt-2px'>填充</div>
              <div className='ml-14px flex items-center'><ColorPicker
                option={fillData}
                onChange={(value: any) => {
                  const data = {
                    ...fillData,
                    color: value.rgb
                  }
                  changeAttr('fill', {
                    type: fillData.type,
                    color: value.rgb
                  })
                  setFillData(data)

                }}
                onSwitchChange={(value) => {
                  const data = {
                    ...fillData,
                    type: value
                  }
                  changeAttr('fill', {
                    type: value,
                    color: value !== 'image' ? fillData.color : undefined,
                    url: value === 'image' ? fillData.url || fillData.bgUrl : undefined,
                  })
                  setFillData(data)

                }}
                onUpload={(url) => {
                  const data = {
                    ...fillData,
                    url: url
                  }
                  changeAttr('fill', {
                    type: fillData.type,
                    url: url,
                    mode: fillData.mode
                  })
                  setFillData(data)

                }}
                onImageModeChange={(mode) => {
                  const data = {
                    ...fillData,
                    mode: mode
                  }
                  changeAttr('fill', {
                    type: fillData.type,
                    url: fillData.url,
                    mode: mode
                  })
                  setFillData(data)
                }}
                onOpenChange={(value) => {
                  if (!view) return
                  if (value) {
                    view.app.editor.visible = false
                    view.app.editor.config.keyEvent = false
                  } else {
                    view.app.editor.visible = true
                    view.app.editor.config.keyEvent = true
                    view.app.tree.emit('update')
                  }
                }}
              />
              </div>
            </div>
            <div className='mb-10px flex items-center'>
              <div className='text-12px text-#00000099 mt-2px'>描边</div>
              <div className='ml-14px flex items-center'>
                <ColorPicker
                  option={strokeData}
                  onChange={(value: any) => {
                    const data = {
                      ...strokeData,
                      color: value.rgb
                    }
                    changeAttr('stroke', {
                      type: strokeData.type,
                      color: value.rgb
                    })
                    setStrokeData(data)
                  }}
                  onSwitchChange={(value) => {
                    const data = {
                      ...strokeData,
                      type: value
                    }
                    changeAttr('stroke', {
                      type: value,
                      color: value !== 'image' ? strokeData.color : undefined,
                      url: value === 'image' ? strokeData.url || strokeData.bgUrl : undefined,
                    })
                    setStrokeData(data)
                  }}
                  onUpload={(url) => {
                    const data = {
                      ...strokeData,
                      url: url
                    }
                    changeAttr('stroke', {
                      type: strokeData.type,
                      url: url,
                      mode: strokeData.mode
                    })
                    setStrokeData(data)

                  }}
                  onImageModeChange={(mode) => {
                    const data = {
                      ...strokeData,
                      mode: mode
                    }
                    changeAttr('stroke', {
                      type: strokeData.type,
                      url: strokeData.url,
                      mode: mode
                    })
                    setStrokeData(data)
                  }}
                  onOpenChange={(value) => {
                    if (!view) return
                    if (value) {
                      view.app.editor.visible = false
                      view.app.editor.config.keyEvent = false
                    } else {
                      view.app.editor.visible = true
                      view.app.editor.config.keyEvent = true
                      view.app.tree.emit('update')
                    }
                  }}
                />
              </div>
            </div>

          </div>
        ),
      }
    ]} />
  </div>

}

export default Appearance