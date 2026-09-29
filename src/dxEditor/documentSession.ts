import type { EditorView } from './index'
import { EditorEvent } from './event'

const DRAFT_KEY = 'dx-editor-draft-v1'
const RECOVERY_KEY = 'dx-editor-recovery-v1'
const MAX_DOWNLOAD_RECOVERIES = 3

type Draft = { version: 1; document: unknown }
type RecoveryKind = 'download' | 'deferred'
type RecoveryCopy = { id: string; savedAt: number; kind: RecoveryKind; document: unknown }
export type RecoverySummary = Pick<RecoveryCopy, 'id' | 'savedAt' | 'kind'>

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

  private readRecoveryCopies(): RecoveryCopy[] {
    try {
      const copies = JSON.parse(this.storage?.getItem(RECOVERY_KEY) || '[]')
      return Array.isArray(copies) ? copies.filter((copy): copy is RecoveryCopy =>
        typeof copy?.id === 'string' && Number.isFinite(copy.savedAt) &&
        (copy.kind === 'download' || copy.kind === 'deferred') && !!copy.document) : []
    } catch { return [] }
  }

  getRecoveryCopies(): RecoverySummary[] {
    return this.readRecoveryCopies().map(({ id, savedAt, kind }) => ({ id, savedAt, kind }))
  }

  private archiveSnapshot(snapshot: string, kind: RecoveryKind): boolean {
    try {
      const storage = this.storage
      if (!storage) return false
      const document = JSON.parse(snapshot)
      const copies = this.readRecoveryCopies()
      const duplicate = copies.find(copy => copy.kind === kind && JSON.stringify(copy.document) === snapshot)
      const entry: RecoveryCopy = {
        id: duplicate?.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        savedAt: Date.now(), kind, document
      }
      let downloads = 0
      const retained = [entry, ...copies.filter(copy => copy.id !== entry.id)].filter(copy =>
        copy.kind === 'deferred' || ++downloads <= MAX_DOWNLOAD_RECOVERIES)
      storage.setItem(RECOVERY_KEY, JSON.stringify(retained))
      return true
    } catch (error) {
      console.warn('Unable to keep a recoverable drawing copy:', error)
      return false
    }
  }

  discardRecoveryCopy(id: string): boolean {
    const copies = this.readRecoveryCopies()
    const remaining = copies.filter(copy => copy.id !== id)
    if (remaining.length === copies.length) return false
    try {
      const storage = this.storage
      if (!storage) return false
      if (remaining.length) storage.setItem(RECOVERY_KEY, JSON.stringify(remaining))
      else storage.removeItem(RECOVERY_KEY)
      return true
    } catch { return false }
  }

  private restoreDocument(document: unknown): boolean {
    const previousSaved = this.savedSnapshot
    try {
      this.editor.importJson(document)
      this.savedSnapshot = previousSaved
      this.onChange()
      if (this.dirty) this.writeDraft(this.snapshot())
      return true
    } catch {
      this.savedSnapshot = previousSaved
      return false
    }
  }

  restoreRecoveryCopy(id: string): boolean {
    const copy = this.readRecoveryCopies().find(item => item.id === id)
    if (!copy || !this.confirmDiscard() || !this.restoreDocument(copy.document)) return false
    this.discardRecoveryCopy(id)
    return true
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

  /** A browser download has no reliable completion event, so keep a copy before starting it. */
  startDownload(start: () => void): boolean {
    const backedUp = this.archiveSnapshot(this.snapshot(), 'download')
    start()
    if (backedUp) this.markSaved()
    return backedUp
  }

  restoreDraft() {
    let draft: Draft | null = null
    try { draft = JSON.parse(this.storage?.getItem(DRAFT_KEY) || 'null') }
    catch { this.clearDraft(); return }
    if (!draft || draft.version !== 1 || !draft.document) return
    if (!window.confirm('发现上次未保存的图纸草稿。确定：立即恢复；取消：稍后从“文件 → 恢复本地草稿”继续。')) {
      if (this.archiveSnapshot(JSON.stringify(draft.document), 'deferred')) this.clearDraft()
      return
    }
    this.restoreDocument(draft.document)
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
