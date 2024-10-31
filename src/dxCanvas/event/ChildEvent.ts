/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-21 17:59:29
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-22 17:40:57
 */
import { IEvent } from './IEvent'
import { Object2D } from '../objects/Object2D'
export class ChildEvent extends IEvent {
    static ADD = 'childEvent.add'
    static REMOVE = 'childEvent.remove'
    value: Object2D[] = []
    constructor(type: string, options: { target: Object2D, value: Object2D[] }) {
        super(type)
        Object.assign(this, options)
    }
}
