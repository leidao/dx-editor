/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-02 14:31:59
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-04 17:36:00
 */
import './index.scss'
import React, { Component } from 'react';

import {
  Hue,
  Alpha,
  Saturation
} from 'react-color/lib/components/common/';
import ChromeFields from 'react-color/lib/components/chrome/ChromeFields'
import Swatch from 'react-color/lib/components/common/Swatch'
import * as color from 'react-color/lib/helpers/color'
import { CustomPicker } from 'react-color';

const HuePointer = () => {
  return <div
    className='w-10px h-10px rounded-10px bg-#fff cursor-pointer'
    style={{ boxShadow: 'rgba(0, 0, 0, 0.6) 0px 0px 2px', transform: 'translate(-2px, -5px)' }}
  >
  </div>
}
const AlphaPointer = () => {
  return <div
    className='w-10px h-10px rounded-10px bg-#fff cursor-pointer'
    style={{ boxShadow: 'rgba(0, 0, 0, 0.6) 0px 0px 2px' }}
  >
  </div>
}

const colors = ['#D9E3F0', '#F47373', '#697689', '#37D67A', '#2CCCE4', '#555555','#000000', '#dce775', '#ff8a65']
const  Color  = (props:any={}) =>{
    const handleChange = (data:any, e:any) => {
      if (data.hex) {
        color.isValidHex(data.hex) && props.onChange({
          hex: data.hex,
          source: 'hex',
        }, e)
      } else {
        props.onChange(data, e)
      }
    }
    return (
      <div>
        <div className='w-246px flex items-center justify-between mb-20px'>
          <div className='w-226px h-120px relative '>
            <Saturation {...props} disableAlpha={false} />
          </div>
          <div className='w-6px h-120px relative'>
            <Hue {...props} direction='vertical' pointer={HuePointer} />
          </div>
        </div>
        <div className='relative w-246px h-10px'>
          <Alpha pointer={AlphaPointer} {...props} />
        </div>
        <div className='relative w-246px mb-10px'>
          <ChromeFields {...props} view='hex' />
        </div>
        <div className='relative w-246px mb-10px colors_grid'>
        { colors.map(color => (
            <Swatch
              key={ color }
              color={ color }
              hex={ color }
              style={{width:'20px',height:'20px',cursor:'pointer'}}
              // active={ color.toLowerCase() === props.hex }
              onClick={ handleChange }
              focusStyle={{
                boxShadow: `0 0 4px ${ color }`,
              }}
              // onSwatchHover={ onSwatchHover }
            />
          )) }
        </div>
      </div>
    );

}


export default CustomPicker(Color);