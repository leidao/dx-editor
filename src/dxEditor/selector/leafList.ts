/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-22 16:40:29
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-23 10:23:43
 */
import { Object2D } from "@/dxCanvas"

export class LeafList {

    public data = new Map<string, Object2D>()
    public get list(): Object2D[] { return [...this.data.values()] }
    public get keys() { return [...this.data.keys()] }

    public get length(): number { return this.data.size }

    constructor(item?: Object2D | Object2D[]) {
        this.reset()
        if (item) item instanceof Array ? this.addList(item) : this.add(item)
    }

    public has(leaf: Object2D): boolean {
        return leaf && this.data.has(leaf.uuid)
    }

    public indexAt(index: number): Object2D {
        return this.list[index]
    }


    public add(leaf: Object2D): void {
        const { data } = this
        if (!data.has(leaf.uuid)) {
            data.set(leaf.uuid, leaf)
        }
    }

    public addList(list: Object2D[]): void {
        for (let i = 0; i < list.length; i++) this.add(list[i])
    }


    public remove(leaf: Object2D): void {
        this.data.delete(leaf.uuid)
    }

    public clone(): LeafList {
        const list = new LeafList()
        list.addList(this.list)
        return list
    }

    public reset(): void {
        this.data.clear()
    }

    public destroy(): void {
        this.reset()
    }
}
