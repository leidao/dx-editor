/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-06 10:54:49
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-21 16:13:29
 */
import ceu from './ceu.svg'
import cus from './cus.svg'
import gnd from './gnd.svg'
import reu from './reu.svg'
import rpeu from './rpeu.svg'
import rpus from './rpus.svg'
import rus from './rus.svg'
import vcc from './vcc.svg'
import ind from './ind.png'

const electricity: any[] = [
  {
    name: 'gnd',
    url: gnd,
    id: 'gnd'
  },
  {
    name: 'vcc',
    url: vcc,
    id: 'vcc'
  },
  {
    name: 'rus',
    url: rus,
    id: 'rus'
  },
  {
    name: 'reu',
    url: reu,
    id: 'reu'
  },
  {
    name: 'rpus',
    url: rpus,
    id: 'rpus'
  },
  {
    name: 'rpeu',
    url: rpeu,
    id: 'rpeu'
  },
  {
    name: 'cus',
    url: cus,
    id: 'cus'
  },
  {
    name: 'ceu',
    url: ceu,
    id: 'ceu'
  },
  {
    name: 'ind',
    url: ind,
    id: 'ind'
  }
]
export default electricity
