import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus, RotateCcw, ZoomIn } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { KIND_STYLES } from './types.js'
import {
  ZOOM_LAYERS,
  canvasExtent,
  layerPayload,
  layoutGrid,
  resolveMappedRepoTrees,
} from './playgroundData.js'

const BOX_TONE = {
  repo: 'border-violet-300 bg-violet-50 text-violet-900',
  file: 'border-primary-200 bg-primary-50 text-primary-900',
  function: 'border-success-200 bg-success-50 text-success-900',
  class: 'border-cyan-200 bg-cyan-50 text-cyan-900',
  const: 'border-amber-200 bg-amber-50 text-amber-900',
  let: 'border-warning-200 bg-warning-50 text-warning-900',
  dir: 'border-line bg-surface text-ink',
}

export default function FlowPlayground({ linkedRepos = [], projectName }) {
  const trees = useMemo(() => resolveMappedRepoTrees(linkedRepos), [linkedRepos])
  const [zoomLevel, setZoomLevel] = useState(0)
  const [focusRepoId, setFocusRepoId] = useState(null)
  const [focusFileId, setFocusFileId] = useState(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [offsets, setOffsets] = useState({})
  const dragRef = useRef(null)
  const panRef = useRef(null)

  useEffect(() => {
    if (trees.length === 1) setFocusRepoId(trees[0].id)
  }, [trees])

  const { items, edges } = useMemo(
    () => layerPayload(zoomLevel, trees, focusRepoId, focusFileId),
    [zoomLevel, trees, focusRepoId, focusFileId],
  )

  const boxes = useMemo(() => {
    const cols = zoomLevel === 0 ? Math.min(3, Math.max(1, items.length)) : zoomLevel === 3 ? 5 : 4
    const laid = layoutGrid(items, {
      boxW: zoomLevel === 0 ? 200 : zoomLevel === 3 ? 150 : 172,
      boxH: zoomLevel === 3 ? 76 : 92,
      cols,
    })
    return laid.map((b) => {
      const off = offsets[b.id]
      return off ? { ...b, x: b.x + off.dx, y: b.y + off.dy } : b
    })
  }, [items, zoomLevel, offsets])

  const extent = useMemo(() => canvasExtent(boxes), [boxes])
  const boxById = useMemo(() => Object.fromEntries(boxes.map((b) => [b.id, b])), [boxes])

  const focusRepo = trees.find((t) => t.id === focusRepoId)

  const resetView = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
    setOffsets({})
  }

  const onBoxPointerDown = (id, e) => {
    if (e.button !== 0) return
    e.stopPropagation()
    const start = { x: e.clientX, y: e.clientY, dx: offsets[id]?.dx ?? 0, dy: offsets[id]?.dy ?? 0 }
    dragRef.current = { id, start }
  }

  const onBoxDoubleClick = (box) => {
    if (zoomLevel === 0 && box.kind === 'repo') {
      setFocusRepoId(box.id)
      setFocusFileId(null)
      setZoomLevel(1)
      return
    }
    if (zoomLevel === 1 && box.kind === 'file') {
      setFocusFileId(box.id)
      setFocusRepoId(box.repoId ?? focusRepoId)
      setZoomLevel(2)
      return
    }
    if (zoomLevel === 2 && box.kind === 'file') {
      setFocusFileId(box.id)
      setZoomLevel(3)
    }
  }

  const onCanvasPointerDown = (e) => {
    if (e.button !== 0 || dragRef.current) return
    panRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  const onPointerMove = useCallback(
    (e) => {
      if (dragRef.current) {
        const { id, start } = dragRef.current
        const dx = start.dx + (e.clientX - start.x) / scale
        const dy = start.dy + (e.clientY - start.y) / scale
        setOffsets((prev) => ({ ...prev, [id]: { dx, dy } }))
        return
      }
      if (panRef.current) {
        const dx = e.clientX - panRef.current.x
        const dy = e.clientY - panRef.current.y
        setPan({ x: panRef.current.panX + dx, y: panRef.current.panY + dy })
      }
    },
    [scale],
  )

  const onPointerUp = () => {
    dragRef.current = null
    panRef.current = null
  }

  if (!linkedRepos.length) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-line bg-white p-8 text-center">
        <p className="text-sm font-medium text-ink">No mapped repositories</p>
        <p className="mt-1 max-w-md text-xs text-ink-muted">
          Link GitHub repos to this project under Overview, then open Flow studio to plot repo → file → dependency → syntax layers.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[560px] flex-col overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ZoomIn size={16} className="text-primary-600" />
          <span className="text-sm font-semibold text-ink">Flow playground</span>
          {projectName ? <span className="text-xs text-ink-muted">· {projectName}</span> : null}
        </div>
        <div className="flex flex-wrap gap-1">
          {ZOOM_LAYERS.map((layer) => (
            <Button
              key={layer.id}
              size="sm"
              variant={zoomLevel === layer.id ? 'primary' : 'ghost'}
              onClick={() => {
                setZoomLevel(layer.id)
                if (layer.id === 0) {
                  setFocusFileId(null)
                }
              }}
            >
              {layer.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{trees.length} repo{trees.length === 1 ? '' : 's'}</Badge>
          <Button size="sm" variant="ghost" className="gap-1" onClick={() => setScale((s) => Math.min(2, s + 0.1))}>
            <Plus size={14} />
          </Button>
          <Button size="sm" variant="ghost" className="gap-1" onClick={() => setScale((s) => Math.max(0.45, s - 0.1))}>
            <Minus size={14} />
          </Button>
          <Button size="sm" variant="ghost" className="gap-1" onClick={resetView}>
            <RotateCcw size={14} /> Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2 text-xs text-ink-muted">
        <button type="button" className="cursor-pointer text-primary-600 hover:underline" onClick={() => setZoomLevel(0)}>
          All repos
        </button>
        {focusRepo ? (
          <>
            <span>/</span>
            <button
              type="button"
              className="cursor-pointer text-primary-600 hover:underline"
              onClick={() => {
                setZoomLevel(1)
                setFocusFileId(null)
              }}
            >
              {focusRepo.name}
            </button>
          </>
        ) : null}
        {focusFileId && boxById[focusFileId] ? (
          <>
            <span>/</span>
            <span className="text-ink">{boxById[focusFileId].name}</span>
          </>
        ) : null}
        <span className="ml-2 text-[10px] text-ink-subtle">Drag boxes · double-click to drill down</span>
      </div>

      <div
        className="relative min-h-[480px] flex-1 cursor-grab overflow-hidden bg-[radial-gradient(circle,_#d4d4d8_1px,_transparent_1px)] bg-size-[16px_16px] bg-position-[0_0] active:cursor-grabbing"
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setScale((s) => Math.min(2, Math.max(0.45, s - e.deltaY * 0.001)))
          }
        }}
      >
        <div
          className="absolute origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            width: extent.width,
            height: extent.height,
          }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            {edges.map((edge) => {
              const a = boxById[edge.from]
              const b = boxById[edge.to]
              if (!a || !b) return null
              const x1 = a.x + a.w / 2
              const y1 = a.y + a.h / 2
              const x2 = b.x + b.w / 2
              const y2 = b.y + b.h / 2
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={zoomLevel === 3 ? '#0d9488' : '#6366f1'}
                  strokeWidth={1.5}
                  strokeOpacity={0.55}
                  markerEnd="url(#playground-arrow)"
                />
              )
            })}
            <defs>
              <marker id="playground-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" fillOpacity="0.7" />
              </marker>
            </defs>
          </svg>

          {boxes.map((box) => {
            const kindLabel = KIND_STYLES[box.kind]?.label ?? box.kind
            const tone = BOX_TONE[box.kind] ?? BOX_TONE.file
            return (
              <div
                key={box.id}
                role="button"
                tabIndex={0}
                className={`absolute flex cursor-grab flex-col rounded-lg border-2 px-3 py-2 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${tone}`}
                style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                onPointerDown={(e) => onBoxPointerDown(box.id, e)}
                onDoubleClick={() => onBoxDoubleClick(box)}
              >
                <span className="text-[10px] font-semibold tracking-wide uppercase opacity-70">{kindLabel}</span>
                <span className="truncate text-sm font-semibold">{box.name}</span>
                {box.path && zoomLevel !== 0 ? (
                  <span className="truncate font-mono text-[10px] opacity-75">{box.path}</span>
                ) : null}
                {box.meta ? <span className="mt-auto text-[10px] opacity-70">{box.meta}</span> : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
