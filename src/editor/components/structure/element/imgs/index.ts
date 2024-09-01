/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-06 10:57:26
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-21 16:12:37
 */
import electricity from './electricity'
import food from './food'
import sewage from './sewage'
export type Children = {
  name: string
  url: string
  id: number
}
const imgs = [
  {
    name: '电路',
    children: electricity as Children[]
  },
]

export default imgs
