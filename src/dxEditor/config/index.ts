/*
 * @Description: 全局配置
 * @Author: ldx
 * @Date: 2024-09-29 10:27:51
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 13:59:11
 */

export enum MoveType {
  'Free' = 0, //自由移动
  'Pix' = 1, //像素基准移动(坐标只能为像素整数倍)
  'Grid' = 2,//网格基准移动(坐标只能为网格数倍) 
}
/** 全局配置 */
class GlobalConfig {
  /** 元素 move 方式 */
  moveType: MoveType = 2
  /** 网格大小 */
  gridSize = 10
  /** 网格颜色 */
  gridColor = '#f0f0f0'
  /** 移动大小 */
  moveSize = 5

  /** 标尺文字颜色 */
  rulerTextColor = '#aaa'
  /** 标尺背景颜色 */
  rulerBgColor = '#eee'
  /** 标尺间隔线颜色 */
  rulerLineColor = '#ccc'
  /** 标尺下边框颜色 */
  rulerBorderColor = '#ccc'
  /** 标尺遮罩颜色 */
  rulerMaskColor = '#e2ebff'

  /** 辅助线颜色 */
  guidelineColor = '#ff0000'
  /** 显示辅助线 */
  guidelineVisible = true

  
}

export default new GlobalConfig()