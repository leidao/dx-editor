import { IEvent, IPointerEvent } from "@/dxCanvas/event"

type Type = 'start' | 'drag' | 'end'
export class DragEvent extends IEvent {
  static START = 'drag.start'
  static DRAG = 'drag'
  static END = 'drag.end'
  constructor(type: Type, event: IPointerEvent) {
    super(type)
    this.origin = event
  }
}

export const MyDragEvent = DragEvent