/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-06 10:57:26
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-29 11:10:03
 */
import mods from './mods'

export type Children = {
  name: string
  url: string
  id: number
}
const imgs = [
  {
    name: '元件',
    children: mods as Children[]
  },
]

export default imgs
