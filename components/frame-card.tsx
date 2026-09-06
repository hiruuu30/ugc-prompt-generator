import Image from 'next/image'
import type { Frame } from '@/lib/frames-catalog'

const phpPrice = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

export function FrameCard({
  frame,
  highlight = false,
}: {
  frame: Frame
  highlight?: boolean
}) {
  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors ${
        highlight ? 'border-primary/60' : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={frame.image || '/placeholder.svg'}
          alt={`${frame.name} — ${frame.style} eyeglass frames`}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {highlight && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-primary-foreground">
            Top match
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-medium leading-none">{frame.name}</h3>
          <span className="font-mono text-sm text-primary">
            {phpPrice.format(frame.price)}
          </span>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {frame.style} · {frame.material}
        </p>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {frame.description}
        </p>
      </div>
    </div>
  )
}
