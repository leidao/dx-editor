/*
 * @Description: 独立圆角
 * @Author: ldx
 * @Date: 2023-12-05 11:14:15
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-03 14:47:38
 */
import React from 'react'

export const BrSetSeparately = React.memo(() => {
  return (
    <svg width="12"
      height="12"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M4 0L4 1 3 1C1.9 1 1 1.9 1 3L1 4 0 4 0 3C0 1.3 1.3 0 3 0L4 0Z"></path>
      <path d="M8 0L9 0C10.7 0 12 1.3 12 3L12 4 11 4 11 3C11 1.9 10.1 1 9 1L8 1 8 0Z"></path>
      <path d="M4 12L3 12C1.3 12 0 10.7 0 9L0 8 1 8 1 9C1 10.1 1.9 11 3 11L4 11 4 12Z"></path>
      <path d="M8 12L8 11 9 11C10.1 11 11 10.1 11 9L11 8 12 8 12 9C12 10.7 10.7 12 9 12L8 12Z"></path>
    </svg>
  )
})
