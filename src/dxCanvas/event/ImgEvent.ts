/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-15 21:59:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-22 17:40:46
 */

import { IEvent } from './IEvent'
import { Object2D } from '../objects/Object2D'
export class ImgEvent extends IEvent {
    static LOAD = 'imgEvent.load'
    constructor(type: string, event: Event) {
        super(type)
        Object.assign(this, event)
    }
}
