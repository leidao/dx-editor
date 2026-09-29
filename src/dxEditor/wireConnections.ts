import { Group, Img, Line, Object2D, Vector2 } from '@/dxCanvas'

export type WireConnection = { targetId: string, portIndex: number }
export type WireConnections = { start?: WireConnection, end?: WireConnection }
export type WirePort = { connection: WireConnection, position: Vector2 }

export function getPortWorldPoint(target: Img, portIndex: number): Vector2 | null {
  const ports = target.userData.ellipseData
  const port = Array.isArray(ports) ? ports[portIndex] : undefined
  if (!port || !Number.isFinite(port.x) || !Number.isFinite(port.y)) return null
  const size = target.userData.portSize
  const baseWidth = Array.isArray(size) && Number.isFinite(size[0]) ? size[0] : target.size.x
  const baseHeight = Array.isArray(size) && Number.isFinite(size[1]) ? size[1] : target.size.y
  const x = baseWidth > 0 ? port.x * target.size.x / baseWidth : port.x
  const y = baseHeight > 0 ? port.y * target.size.y / baseHeight : port.y
  return new Vector2(x, y).applyMatrix3(target.moMatrix)
}

export function findWirePort(tree: Group, point: Vector2, tolerance: number): WirePort | null {
  let nearest: WirePort | null = null
  let nearestDistance = tolerance
  tree.traverse(item => {
    if (!(item instanceof Img)) return
    let ancestor: Object2D | undefined = item
    while (ancestor && ancestor !== tree) {
      if (!ancestor.visible || ancestor.locked) return
      ancestor = ancestor.parent
    }
    const ports = item.userData.ellipseData
    if (!Array.isArray(ports)) return
    ports.forEach((_: unknown, portIndex: number) => {
      const position = getPortWorldPoint(item, portIndex)
      if (!position) return
      const distance = position.distanceTo(point)
      if (distance <= nearestDistance) {
        nearestDistance = distance
        nearest = { connection: { targetId: item.uuid, portIndex }, position }
      }
    })
  })
  return nearest
}

/** Keep endpoints on their image ports while retaining every intermediate vertex. */
export function syncWireConnections(tree: Group) {
  const targets = new Map<string, Img>()
  const wires: Line[] = []
  tree.traverse(item => {
    if (item instanceof Img) targets.set(item.uuid, item)
    if (item instanceof Line && item.userData.connections && typeof item.userData.connections === 'object') wires.push(item)
  })
  for (const wire of wires) {
    const connections = wire.userData.connections as WireConnections
    const points = wire.toJSON().points as [number, number][]
    if (points.length < 2) continue
    let changed = false
    for (const end of ['start', 'end'] as const) {
      const connection = connections[end]
      if (!connection) continue
      const target = targets.get(connection.targetId)
      const position = target && getPortWorldPoint(target, connection.portIndex)
      if (!position) {
        delete connections[end]
        continue
      }
      const local = position.applyMatrix3(wire.worldMatrix.clone().invert())
      const index = end === 'start' ? 0 : points.length - 1
      if (points[index][0] !== local.x || points[index][1] !== local.y) {
        points[index] = local.toArray() as [number, number]
        changed = true
      }
    }
    if (!changed) continue
    wire.setPoints(points)
    wire.userData._points = points.map(([x, y]) => {
      const world = new Vector2(x, y).applyMatrix3(wire.worldMatrix)
      return { x: world.x, y: world.y }
    })
  }
}

/** A copied wire only keeps links to images copied in the same operation. */
export function remapWireConnections(originals: Object2D[], copies: Object2D[]) {
  const idMap = new Map<string, string>()
  const pairs: [Object2D, Object2D][] = originals.map((item, index) => [item, copies[index]])
  for (let index = 0; index < pairs.length; index++) {
    const [original, copy] = pairs[index]
    idMap.set(original.uuid, copy.uuid)
    if (original instanceof Group && copy instanceof Group) {
      original.children.forEach((child, childIndex) => pairs.push([child, copy.children[childIndex]]))
    }
  }
  for (const [, copy] of pairs) {
    if (!(copy instanceof Line) || !copy.userData.connections) continue
    const connections = copy.userData.connections as WireConnections
    for (const end of ['start', 'end'] as const) {
      const connection = connections[end]
      if (!connection) continue
      const mapped = idMap.get(connection.targetId)
      if (mapped) connection.targetId = mapped
      else delete connections[end]
    }
  }
}
