function isAtomicValue(data: any) {
  return data === null || typeof data !== 'object'
}

export function reconcileSnapshot(draft: any, data: any): void {
  if (Array.isArray(draft)) draft.length = data.length

  for (const key of Object.keys(draft)) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) delete draft[key]
  }

  for (const [key, value] of Object.entries(data)) {
    if (!Object.prototype.hasOwnProperty.call(draft, key)) {
      draft[key] = value
    } else if (
      !isAtomicValue(draft[key]) && !isAtomicValue(value) &&
      Array.isArray(draft[key]) === Array.isArray(value)
    ) {
      reconcileSnapshot(draft[key], value)
    } else {
      draft[key] = value
    }
  }
}
