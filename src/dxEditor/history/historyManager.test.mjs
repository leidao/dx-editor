import assert from 'node:assert/strict'
import { test } from 'node:test'
import { reconcileSnapshot } from './reconcileSnapshot.ts'

test('history retains zero, false and empty string values', () => {
  const draft = { shape: { x: 10, visible: true, label: 'old' } }
  reconcileSnapshot(draft, { shape: { x: 0, visible: false, label: '' } })
  assert.deepEqual(draft, { shape: { x: 0, visible: false, label: '' } })
})

test('history deletes a value that was previously falsy', () => {
  const draft = { shape: { x: 0, visible: false, label: '' } }
  reconcileSnapshot(draft, { shape: {} })
  assert.deepEqual(draft, { shape: {} })
})

test('history removes deleted keys and truncates nested child arrays', () => {
  const draft = { shape: { removed: 'old', children: [{ name: 'A' }, { name: 'B' }] } }
  reconcileSnapshot(draft, { shape: { children: [{ name: 'updated' }] } })
  assert.deepEqual(draft, { shape: { children: [{ name: 'updated' }] } })
})
