'use client'

import { useState } from 'react'
import { FaceScanner, type Capture } from '@/components/face-scanner'
import { ResultsPanel } from '@/components/results-panel'
import { FrameCard } from '@/components/frame-card'
import { FRAMES } from '@/lib/frames-catalog'
import { Glasses, ShieldCheck } from 'lucide-react'

export default function Page() {
  const [result, setResult] = useState<Capture | null>(null)

  return (
    <main className="min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <Glasses className="size-5 text-primary" />
            <span className="font-mono text-sm font-medium uppercase tracking-[0.25em]">
              Optyx
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <ShieldCheck className="size-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              On-device
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          Face shape frame finder
        </p>
        <h1 className="mt-3 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Find frames built for your face.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
          Real machine-learning face landmark detection reads your proportions
          live, classifies your face shape, and matches eyeglasses that
          actually suit you.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <FaceScanner onAnalyze={setResult} />
          </div>
          <ResultsPanel result={result} />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="text-lg font-medium">The full collection</h2>
            <p className="text-sm text-muted-foreground">
              Eight signature silhouettes to browse.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FRAMES.map((frame) => (
              <FrameCard key={frame.id} frame={frame} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Optyx — Demo catalog
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Powered by MediaPipe
          </span>
        </div>
      </footer>
    </main>
  )
}
