/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-04 15:14:33
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-04 17:37:15
 */
import { Radio, Tooltip, Image } from "antd"

import solid from './images/solid.png'
import linear from './images/linear.png'
import radial from './images/radial.png'
import angular from './images/angular.png'
import image from './images/image.png'

interface Props {
  type: string
  onChange: (v: any) => void
}

const SwitchHeader: React.FC<Props> = ({ type, onChange }) => {
  return <Radio.Group
    value={type}
    // buttonStyle="solid"
    className="w-100% flex mb-10px"
    onChange={(e) => {
      onChange(e.target.value)
    }}
  >
    <Tooltip placement="bottom" title='纯色填充' arrow={false}>
      <Radio.Button value="solid">
        <Image
          width={18}
          height={18}
          src={solid}
          fallback={image}
          preview={false}
          className="mt--3px"
        />
      </Radio.Button>
    </Tooltip>
    <Tooltip placement="bottom" title='线性渐变' arrow={false}>
      <Radio.Button value="linear" disabled>
        <Image
          width={18}
          height={18}
          src={linear}
          fallback={image}
          preview={false}
          className="mt--3px"
        />
      </Radio.Button>
    </Tooltip>
    <Tooltip placement="bottom" title='径向渐变' arrow={false}>
      <Radio.Button value="radial" disabled>
        <Image
          width={18}
          height={18}
          src={radial}
          fallback={image}
          preview={false}
          className="mt--3px"
        />
      </Radio.Button>
    </Tooltip>
    <Tooltip placement="bottom" title='角度渐变' arrow={false}>
      <Radio.Button value="angular" disabled>
        <Image
          width={18}
          height={18}
          src={angular}
          fallback={image}
          preview={false}
          className="mt--3px"
        />
      </Radio.Button>
    </Tooltip>
    <Tooltip placement="bottom" title='图片填充' arrow={false}>
      <Radio.Button value="image">
        <Image
          width={18}
          height={18}
          src={image}
          fallback={image}
          preview={false}
          className="mt--3px"
        />
      </Radio.Button>
    </Tooltip>
  </Radio.Group>
}

export default SwitchHeader