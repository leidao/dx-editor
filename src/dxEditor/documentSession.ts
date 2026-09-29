import type { EditorView } from './index'
import { EditorEvent } from './event'

const DRAFT_KEY = 'dx-editor-draft-v1'

type Draft = { version: 1; document: unknown }

/** Tracks changes against the last downloaded/opened document and keeps a local recovery copy. */
export default class DocumentSession {
  dirty = false
  private savedSnapshot: string
  private draftTimer: ReturnType<typeof setTimeout> | undefined

  constructor(private editor: EditorView) {
    this.savedSnapshot = this.snapshot()
    for (const type of [EditorEvent.ADD, EditorEvent.REMOVE, EditorEvent.UPDATE, EditorEvent.HISTORY_CHANGE]) {
      editor.addEventListener(type, this.onChange)
    }
    window.addEventListener('beforeunload', this.beforeUnload)
  }

  private snapshot() {
    const document = this.editor.tree.toJSON()
    const active = this.editor.selector?.editing ? this.editor.selector.element : null
    if (active && 'uuid' in active) {
      const visibleIds = new Set([active.uuid, active.children?.[0]?.uuid].filter(Boolean))
      const reveal = (item: any) => {
        if (visibleIds.has(item.uuid)) delete item.visible
        item.children?.forEach(reveal)
      }
      reveal(document)
    }
    return JSON.stringify(document)
  }

  private get storage(): Storage | null {
    try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
  }

  private writeDraft(snapshot: string) {
    try { this.storage?.setItem(DRAFT_KEY, JSON.stringify({ version: 1, document: JSON.parse(snapshot) })) }
    catch (error) { console.warn('Unable to save the local drawing draft:', error) }
  }

  private clearDraft() {
    if (this.draftTimer) clearTimeout(this.draftTimer)
    this.draftTimer = undefined
    try { this.storage?.removeItem(DRAFT_KEY) } catch { /* Storage may be unavailable. */ }
  }

  private onChange = () => {
    const snapshot = this.snapshot()
    this.dirty = snapshot !== this.savedSnapshot
    if (!this.dirty) { this.clearDraft(); return }
    if (this.draftTimer) clearTimeout(this.draftTimer)
    this.draftTimer = setTimeout(() => {
      this.draftTimer = undefined
      this.writeDraft(this.snapshot())
    }, 500)
  }

  private beforeUnload = (event: BeforeUnloadEvent) => {
    this.onChange()
    if (!this.dirty) return
    this.writeDraft(this.snapshot())
    event.preventDefault()
    event.returnValue = ''
  }

  confirmDiscard(message = '当前图纸有未保存的修改，继续将丢失这些修改。继续吗？') {
    this.onChange()
    return !this.dirty || window.confirm(message)
  }

  markSaved() {
    this.savedSnapshot = this.snapshot()
    this.dirty = false
    this.clearDraft()
  }

  restoreDraft() {
    let draft: Draft | null = null
    try { draft = JSON.parse(this.storage?.getItem(DRAFT_KEY) || 'null') }
    catch { this.clearDraft(); return }
    if (!draft || draft.version !== 1 || !draft.document) return
    if (!window.confirm('发现上次未保存的图纸草稿，是否恢复？')) { this.clearDraft(); return }
    const previousSaved = this.savedSnapshot
    try {
      this.editor.importJson(draft.document)
      this.savedSnapshot = previousSaved
      this.onChange()
    } catch {
      this.clearDraft()
    }
  }

  destroy() {
    if (this.dirty) this.writeDraft(this.snapshot())
    if (this.draftTimer) clearTimeout(this.draftTimer)
    for (const type of [EditorEvent.ADD, EditorEvent.REMOVE, EditorEvent.UPDATE, EditorEvent.HISTORY_CHANGE]) {
      this.editor.removeEventListener(type, this.onChange)
    }
    window.removeEventListener('beforeunload', this.beforeUnload)
  }
}
