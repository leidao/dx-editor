/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-08-30 16:23:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 17:15:46
 */

import { InputNumber } from "antd";
import { toFixed } from '@/editor/utils'
import './index.scss'
import { SizeType } from "antd/es/config-provider/SizeContext";
import { TriangleDown, TriangleUp } from "./icons";
interface INumberInputProps {
  value?: string | number;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (newValue: number) => void;
  onBlur?: (event: any) => void;
  onFocus?: (event: any) => void;
  onMouseEnter?: (event: any) => void;
  onMouseLeave?: (event: any) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonAfter?: React.ReactNode;
  className?: string
  style?: any
  disabled?: boolean
  variant?: "filled" | "outlined" | "borderless" | undefined
  size?: SizeType
  controls?: boolean | {
    upIcon?: React.ReactNode;
    downIcon?: React.ReactNode;
  } | undefined
}

const NumberInput: React.FC<INumberInputProps> = ({
  value = '',
  placeholder = '',
  min = -Infinity,
  max = Infinity,
  onChange,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  prefix,
  suffix,
  addonAfter,
  className,
  style,
  size = 'small',
  variant = 'outlined',
  step = 1,
  disabled,
  controls = { upIcon: <TriangleUp />, downIcon: <TriangleDown /> }
}) => {
  return <div className="panel_input_number">
    <InputNumber
      size={size}
      value={value}
      min={min}
      max={max}
      step={step}
      controls={controls}
      variant={variant}
      placeholder={placeholder}
      formatter={(value) => `${toFixed(value, 2)}`}
      className={className}
      style={style}
      disabled={disabled}
      onPressEnter={(event: any) => {
        const value = event.target?.value
        if (!isNaN(value - parseFloat(value))) {
          onChange && onChange(value)
        }
      }}
      onStep={(value: any, info: any) => {
        if (!isNaN(value - parseFloat(value))) {
          onChange && onChange(value)
        }
      }}
      onBlur={(event: any) => {
        const value = event.target?.value
        if (!isNaN(value - parseFloat(value))) {
          onChange && onChange(value)
        }
        onBlur && onBlur(event)
      }}
      onFocus={(event: any) =>
        onFocus && onFocus(event)
      }
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      prefix={prefix}
      suffix={suffix}
      addonAfter={addonAfter}
    />
  </div>
}

export default NumberInput