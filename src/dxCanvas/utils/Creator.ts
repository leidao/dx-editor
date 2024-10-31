
import { IObject, Object2D } from "../objects"



export const Creator = {

    list: {} as IObject,

    register(UI: any): void {
        const { tag } = UI.prototype 
        list[tag] = UI
    },

    get(tag: string): Object2D {
        return list[tag]
    }

}

const { list } = Creator