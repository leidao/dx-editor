import { IEvent, IKeyboardEvent } from "@/dxCanvas/event"

type Type = 'down' | 'up' | 'hold'
export class KeyEvent extends IEvent {

  static DOWN = 'key.down'
  static UP = 'key.up'
  static HOLD = 'key.hold'

  constructor(type: Type, event: IKeyboardEvent) {
    super(type)
    this.origin = event
  }

}