/*
 * @Description: 颜色
 * @Author: ldx
 * @Date: 2024-09-02 14:28:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-03 16:08:35
 */
import { Col, ColorPicker, ColorPickerProps, Divider, Row } from "antd";
// import { cyan, generate, green, presetPalettes, red } from '@ant-design/colors';

interface Props {
  value?: string
  onChange?: (value: string) => void
}


const Color: React.FC<Props> = ({ value, onChange }) => {


  return <ColorPicker
    size="small"
    value={value}
    onChange={(color) => {
      onChange && onChange(color.toHex())
    }}
  // allowClear
  // mode="gradient"
  />
}

export default Color