import type { Capture } from '@/components/face-scanner'
import { FrameCard } from '@/components/frame-card'
import { SHAPE_INFO } from '@/lib/face-shape'
import { getRecommendations } from '@/lib/frames-catalog'

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-secondary/40 p-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  )
}

export function ResultsPanel({ result }: { result: Capture | null }) {
  if (!result) {
    return (
      <div className="flex h-full flex-col justify-center gap-4 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Awaiting scan
        </p>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          Start your camera and capture a frame. We detect 478 facial landmarks
          in real time, measure your proportions, and match frames to your face
          shape.
        </p>
      </div>
    )
  }

  const info = SHAPE_INFO[result.shape]
  const recs = getRecommendations(result.shape)
  const m = result.measurements

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          {result.snapshot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.snapshot || '/placeholder.svg'}
              alt="Captured face"
              className="size-20 shrink-0 rounded-lg border border-border object-cover"
            />
          )}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Detected face shape
            </span>
            <span className="text-3xl font-semibold leading-none text-primary">
              {result.shape}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {Math.round(result.confidence * 100)}% match confidence
            </span>
          </div>
        </div>

        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {info.description}
        </p>

        {/* Confidence distribution across all shapes */}
        <div className="flex flex-col gap-1.5">
          {result.scores.map((s) => (
            <div key={s.shape} className="flex items-center gap-3">
              <span className="w-16 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {s.shape}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(2, s.score * 100)}%` }}
                />
              </div>
              <span className="w-9 text-right font-mono text-[11px] text-muted-foreground">
                {Math.round(s.score * 100)}%
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Length ÷ Width" value={m.lengthToWidth.toFixed(2)} />
          <Metric label="Forehead ÷ Cheek" value={m.foreheadToCheek.toFixed(2)} />
          <Metric label="Jaw ÷ Cheek" value={m.jawToCheek.toFixed(2)} />
          <Metric label="Jaw ÷ Forehead" value={m.jawToForehead.toFixed(2)} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">Recommended for you</h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {info.tip}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recs.map((frame, i) => (
            <FrameCard key={frame.id} frame={frame} highlight={i === 0} />
          ))}
        </div>
      </div>
    </div>
  )
}
