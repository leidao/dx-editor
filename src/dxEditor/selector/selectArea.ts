import { Bounds, Rect, Vector2 } from "@/dxCanvas";
import { EditorView } from "..";

export class SelectArea {
  fillArea = new Rect({ hittable: false, enableCamera: false, style: { fillStyle: '#4775fc', globalAlpha: 0.3 } })
  strokeArea = new Rect({ hittable: false, enableCamera: false, style: { strokeStyle: '#4775fc' } })
  bounds = new Bounds
  constructor(public editor: EditorView) { }

  setPoistion(position: Vector2) {
    this.fillArea.position.copy(position)
    this.strokeArea.position.copy(position)
    this.editor.sky.add(this.fillArea)
    this.editor.sky.add(this.strokeArea)
  }
  setRect(pagePoint: Vector2) {
    const { x, y } = pagePoint.sub(this.fillArea.position)
    this.fillArea.setRect(x, y)
    this.strokeArea.setRect(x, y)
    this.bounds.min = this.editor.sky.getWorldByPage(this.fillArea.bounds.minX,this.fillArea.bounds.minY)
    this.bounds.max= this.editor.sky.getWorldByPage(this.fillArea.bounds.maxX,this.fillArea.bounds.maxY)
    const oldList = this.editor.selector.leafList.clone()
    this.editor.tree.children.forEach(item => {
      const flag = this.bounds.hit(item.bounds)
      if (flag) {
        this.editor.selector.addItem(item)
      } else {
        this.editor.selector.removeItem(item)
      }
    })
    this.editor.selector.compareSelectChange(this.editor.selector.leafList, oldList)
    this.editor.sky.render()
  }
  clear() {
    this.fillArea.setRect(0, 0)
    this.strokeArea.setRect(0, 0)
    this.editor.sky.remove(this.fillArea)
    this.editor.sky.remove(this.strokeArea)
    this.editor.sky.render()
  }
}