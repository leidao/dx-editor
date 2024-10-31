/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-15 21:59:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-29 14:23:49
 */

import { IEvent } from './IEvent'
import { Object2D } from '../objects/Object2D'
export class OrbitEvent extends IEvent {
    static CHANGE = 'orbitEvent.change'
    constructor(type: string, event?: WheelEvent | PointerEvent) {
        super(type)
        this.origin = event
    }
}
