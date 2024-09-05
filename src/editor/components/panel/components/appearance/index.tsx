import './index.scss'
import { IUI } from "@leafer-ui/interface"
import { Checkbox, Collapse, Radio, Select, Tooltip } from "antd"
import { BrAetAll, BrSetSeparately, StrokeWidth } from "./icons"
import NumberInput from '../numberInput'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/editor/context'
import ColorPicker from '../color/index'
import image from '@/editor/components/panel/components/color/images/bg2.png'

const strokeAlignOptions = [
  {
    label: '内部',
    value: 'inside'
  },
  {
    label: '居中',
    value: 'center'
  },
  {
    label: '外部',
    value: 'outside'
  },
]
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
    mode: 'cover',
  })


  const [strokeAlign, setStrokeAlign] = useState('center')
  const [strokeWidth, setStrokeWidth] = useState(1)
  const [strokeWidthFixed, setStrokeWidthFixed] = useState(false)
  const [strokeType, setStrokeType] = useState('solid')
  const [dashPattern, setDashPattern] = useState([20, 10])
  const [dashOffset, setDashOffset] = useState(0)

  const [strokeWidthOpen, setStrokeWidthOpen] = useState(false)

  useEffect(() => {
    if (selectList.length === 0) return
    const item = selectList[0]
    if (item) {
      // console.log('item', item);
      const cornerRadius = item.cornerRadius
      const radius = cornerRadius !== undefined ? (Array.isArray(cornerRadius) ? cornerRadius : [+cornerRadius, +cornerRadius, +cornerRadius, +cornerRadius]) : [0, 0, 0, 0]
      setCornerRadius(radius)
      setCornerRadiusType(radius.every(item => item === radius[0]) ? '1' : '2')
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
      setStrokeAlign(item.strokeAlign || 'center')
      setStrokeWidth(+(item.strokeWidth || 1))
      setStrokeWidthFixed(item.strokeWidthFixed || false)
      setDashPattern(typeof item.dashPattern === 'string' ? [+item.dashPattern, +item.dashPattern] : item.dashPattern || [20, 10])
      setDashOffset(item.dashOffset || 0)
      setStrokeType(!item.dashPattern && !item.dashOffset ? 'solid' : 'dashed')
    }
  }, [selectList])

  const view = useContext(EditorContext)

  type Attr = 'cornerRadius' | 'fill' | 'stroke' | 'strokeWidth' | 'strokeAlign' | 'strokeWidthFixed' | 'dashPattern' | 'dashOffset'
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
                  onChange={(e: any) => {
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
                    view.app.editor.visible = false
                    view.app.editor.config.keyEvent = false
                  }}
                  onBlur={() => {
                    if (!view) return
                    view.app.editor.visible = true
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
                      view.app.editor.visible = false
                      view.app.editor.config.keyEvent = false
                    }}
                    onBlur={() => {
                      if (!view) return
                      view.app.editor.visible = true
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
                      view.app.editor.visible = false
                      view.app.editor.config.keyEvent = false
                    }}
                    onBlur={() => {
                      if (!view) return
                      view.app.editor.visible = true
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
                      view.app.editor.visible = false
                      view.app.editor.config.keyEvent = false
                    }}
                    onBlur={() => {
                      if (!view) return
                      view.app.editor.visible = true
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
              <div className='ml-14px'>
                <Select
                  value={strokeAlign}
                  className='w-80px'
                  // variant="borderless"
                  variant='filled'
                  size='small'
                  options={strokeAlignOptions}
                  onChange={(value) => {
                    setStrokeAlign(value)
                    changeAttr('strokeAlign', value)
                  }}
                />
              </div>
              <div className='ml-14px'>
                <Tooltip open={strokeWidthOpen} placement="bottom" title='描边宽度' arrow={false}>
                  <span
                    onMouseEnter={() => {
                      setStrokeWidthOpen(true)
                    }}
                    onMouseLeave={() => {
                      setStrokeWidthOpen(false)
                    }}
                  >
                    <NumberInput
                      className="w-80px"
                      value={strokeWidth}
                      prefix={<StrokeWidth />}
                      min={0}
                      step={1}
                      onFocus={() => {
                        setStrokeWidthOpen(false)
                        if (!view) return
                        view.app.editor.visible = false
                        view.app.editor.config.keyEvent = false
                      }}
                      onBlur={() => {
                        if (!view) return
                        view.app.editor.visible = true
                        view.app.editor.config.keyEvent = true
                        view.app.tree.emit('update')
                      }}
                      onChange={(value) => {
                        setStrokeWidth(value)
                        changeAttr('strokeWidth', value)
                      }}
                    />
                  </span>
                </Tooltip>
              </div>
            </div>
            <div className='mb-10px flex items-center'>
              <div className='w-24px'></div>
              <div className="flex items-start ml-14px">
                <div>
                  <Radio.Group value={strokeType} size='small'
                    onChange={(e: any) => {
                      const value = e.target.value
                      setStrokeType(value)
                      if (value === 'solid') {
                        changeAttr('dashPattern', undefined)
                        changeAttr('dashPattern', 0)
                      } else {
                        changeAttr('dashPattern', dashPattern)
                        changeAttr('dashOffset', dashOffset)
                      }

                    }}
                  >
                    <Tooltip placement="bottom" title='直线' arrow={false}>
                      <Radio.Button value="solid">
                        <div className='h-22px flex items-center justify-center'>
                          <div className='w-16px h-2px border-2px border-t-solid border-#000' />
                        </div>
                      </Radio.Button>
                    </Tooltip>
                    <Tooltip placement="bottom" title='虚线' arrow={false}>
                      <Radio.Button value="dashed">
                        <div className='h-22px flex items-center justify-center'>
                          <div className='w-16px h-2px border-2px border-t-dashed border-#000' />
                        </div>
                      </Radio.Button>
                    </Tooltip>
                  </Radio.Group>
                </div>
                <div className='ml-14px flex items-center rounded_group'>
                  {strokeType === 'dashed' && <>
                    <div>
                      <div>
                        <NumberInput
                          className="w-46px"
                          style={{ borderRounds: '4px 0px 0px 4px' }}
                          value={dashOffset}
                          min={0}
                          onFocus={() => {
                            if (!view) return
                            view.app.editor.visible = false
                            view.app.editor.config.keyEvent = false
                          }}
                          onBlur={() => {
                            if (!view) return
                            view.app.editor.visible = true
                            view.app.editor.config.keyEvent = true
                            view.app.tree.emit('update')
                          }}
                          onChange={(value) => {
                            setDashOffset(value)
                            changeAttr('dashOffset', value)
                          }}
                        />
                      </div>
                      <div className='text-12px text-#333 mt-4px'>
                        偏移
                      </div>
                    </div>
                    <div>
                      <div>
                        <NumberInput
                          className="w-46px rounded-0px"
                          value={dashPattern[0]}
                          min={0}
                          onFocus={() => {
                            if (!view) return
                            view.app.editor.visible = false
                            view.app.editor.config.keyEvent = false
                          }}
                          onBlur={() => {
                            if (!view) return
                            view.app.editor.visible = true
                            view.app.editor.config.keyEvent = true
                            view.app.tree.emit('update')
                          }}
                          onChange={(value) => {
                            const data = [value, dashPattern[1]]
                            setDashPattern(data)
                            changeAttr('dashPattern', data)
                          }}
                        />
                      </div>
                      <div className='text-12px text-#333 mt-4px'>
                        长度
                      </div>
                    </div>
                    <div>
                      <div>
                        <NumberInput
                          className="w-46px rounded-0px"
                          value={dashPattern[1]}
                          min={0}
                          style={{ borderRounds: '0px 4px 4px 0px' }}
                          onFocus={() => {
                            if (!view) return
                            view.app.editor.visible = false
                            view.app.editor.config.keyEvent = false
                          }}
                          onBlur={() => {
                            if (!view) return
                            view.app.editor.visible = true
                            view.app.editor.config.keyEvent = true
                            view.app.tree.emit('update')
                          }}
                          onChange={(value) => {
                            const data = [dashPattern[0], value]
                            setDashPattern(data)
                            changeAttr('dashPattern', data)
                          }}
                        />
                      </div>
                      <div className='text-12px text-#333 mt-4px'>
                        间隙
                      </div>
                    </div>
                  </>}
                </div>
              </div>
            </div>

          </div>
        ),
      }
    ]} />
  </div>

}

export default Appearance