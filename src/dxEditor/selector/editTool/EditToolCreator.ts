/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-06 15:14:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-24 11:31:44
 */

import { EditorView } from "@/dxEditor"
import EditTool from "./editTool"
import { IObject } from "@/dxCanvas"

export function registerEditTool() {
    return (target: IObject) => {
        EditToolCreator.register(target)
    }
}

export const registerInnerEditor = registerEditTool

export const EditToolCreator = {

    list: {} as IObject,

    register(EditTool: IObject): void {
        const { tag } = EditTool.prototype as EditTool
        list[tag] = EditTool
    },

    get(tag: string, editor: EditorView): EditTool {
        return new list[tag](editor)
    }
}

const { list } = EditToolCreator