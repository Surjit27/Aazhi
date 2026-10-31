import { useWorkflowStore } from '../../stores/workflowStore.js'
import { PALETTE_ITEMS, DRAG_KIND_TYPE, KIND_META } from './nodeKinds.js'

export default function NodePalette() {
  const addNode = useWorkflowStore((s) => s.addNode)
  const nodes = useWorkflowStore((s) => s.nodes)

  const addAtCenter = (item) => {
    const offset = nodes.length * 24
    addNode(item.kind, { x: 200 + offset, y: 420 + offset }, item.defaults)
  }

  return (
    <aside className="hidden w-52 shrink-0 flex-col border-r border-line bg-white lg:flex">
      <div className="border-b border-line px-3 py-2.5">
        <p className="text-[13px] font-semibold text-ink">Node palette</p>
        <p className="text-[11px] text-ink-muted">Drag onto the canvas or click to add</p>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto p-2 scrollbar-thin">
        {PALETTE_ITEMS.map((item) => {
          const meta = KIND_META[item.kind]
          const Icon = meta.icon
          return (
            <li key={item.kind}>
              <button
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_KIND_TYPE, item.kind)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onClick={() => addAtCenter(item)}
                className="group flex w-full cursor-grab items-center gap-2.5 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-line hover:bg-surface active:cursor-grabbing"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface"
                  style={{ color: meta.accent }}
                >
                  <Icon size={14} />
                </span>
                <span className="text-[13px] text-ink">{meta.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
