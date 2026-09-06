'use client'

import { useState } from 'react'
import { FaceScanner, type Capture } from '@/components/face-scanner'
import { ResultsPanel } from '@/components/results-panel'
import { FrameCard } from '@/components/frame-card'
import { FRAMES } from '@/lib/frames-catalog'
import { Glasses, ShieldCheck } from 'lucide-react'

function BrickBondLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`inline-flex items-center ${compact ? 'gap-2' : 'gap-2.5'}`} aria-label="Brick & Bond">
      <span className="relative inline-block h-5 w-9 shrink-0" aria-hidden="true">
        <svg className="absolute inset-0 h-full w-full fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1143 631">
          <path d="M20 20H385V36C385 79 420 113 464 113V212H220V422H464V518C420 518 385 552 385 596V610H20Z"/>
          <path d="M1122 20H757V36C757 79 722 113 678 113V212H922V422H678V518C722 518 757 552 757 596V610H1122Z"/>
        </svg>
        <svg className="absolute inset-0 h-full w-full fill-[#ff4f22]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1143 631">
          <rect x="465" y="213" width="211" height="208"/>
        </svg>
      </span>
      <svg
        className={`${compact ? 'h-3.5 w-[118px]' : 'h-4 w-[135px]'} fill-current`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="18 18 2202 206"
        aria-hidden="true"
      >
        <g>
          <path d="M19 22 L18 218 L22 221 L161 220 L188 214 L206 202 L213 192 L218 175 L218 151 L215 140 L210 131 L202 123 L193 118 L206 105 L212 88 L212 66 L207 49 L198 37 L179 26 L155 21 L22 20 Z M58 138 L149 137 L162 139 L170 143 L176 150 L178 157 L177 168 L166 180 L155 183 L59 183 Z M58 59 L153 59 L162 62 L168 67 L172 76 L172 85 L166 96 L152 102 L59 102 Z"/>
          <path d="M250 20 L248 22 L248 218 L287 218 L287 166 L289 162 L360 162 L400 219 L443 219 L443 214 L404 157 L405 155 L419 149 L430 140 L439 125 L442 114 L443 72 L439 56 L432 44 L423 35 L413 29 L383 21 Z M288 59 L373 58 L386 61 L392 64 L399 71 L403 81 L403 102 L401 108 L391 119 L376 124 L288 124 Z"/>
          <path d="M477 20 L474 22 L474 217 L476 219 L512 219 L514 217 L514 22 L512 20 Z"/>
          <path d="M559 51 L552 69 L550 80 L549 149 L555 180 L562 193 L573 204 L587 212 L609 218 L627 220 L674 220 L700 218 L723 212 L736 205 L747 195 L752 188 L758 173 L760 160 L759 147 L721 147 L719 151 L719 159 L714 170 L707 177 L698 181 L689 183 L622 183 L610 180 L598 172 L592 162 L589 144 L590 86 L596 70 L604 62 L622 56 L693 57 L706 62 L713 68 L718 77 L721 94 L759 94 L760 78 L757 63 L753 53 L744 41 L730 31 L714 25 L694 21 L672 19 L628 19 L607 21 L585 28 L572 36 Z"/>
          <path d="M792 22 L792 218 L831 218 L832 160 L868 137 L946 219 L996 219 L998 217 L998 215 L902 114 L903 111 L995 24 L994 21 L944 21 L866 94 L833 116 L831 115 L832 24 L828 20 L795 20 Z"/>
          <path d="M1314 22 L1314 220 L1464 220 L1490 212 L1505 199 L1513 181 L1514 152 L1507 133 L1501 126 L1489 118 L1501 107 L1505 100 L1508 89 L1508 65 L1502 47 L1493 36 L1475 26 L1446 21 Z M1353 139 L1457 139 L1470 147 L1473 153 L1473 168 L1464 179 L1453 183 L1355 184 L1353 182 Z M1353 59 L1448 59 L1459 63 L1465 69 L1468 75 L1468 86 L1461 97 L1449 102 L1354 102 Z"/>
          <path d="M1553 47 L1546 60 L1541 83 L1541 157 L1547 183 L1553 194 L1560 202 L1577 213 L1596 219 L1613 221 L1677 221 L1709 215 L1727 205 L1736 196 L1743 185 L1749 165 L1750 84 L1744 58 L1738 47 L1729 37 L1717 29 L1691 21 L1671 19 L1603 20 L1582 25 L1564 35 Z M1593 64 L1602 59 L1611 57 L1680 57 L1695 62 L1703 69 L1710 87 L1711 140 L1707 165 L1697 177 L1686 182 L1674 184 L1617 184 L1599 180 L1586 169 L1583 163 L1580 145 L1580 95 L1583 78 L1587 70 Z"/>
          <path d="M1784 21 L1782 26 L1783 218 L1785 220 L1819 220 L1822 218 L1823 76 L1933 219 L1979 220 L1981 218 L1981 22 L1979 20 L1944 20 L1942 22 L1941 166 L1829 20 Z"/>
          <path d="M2019 23 L2019 218 L2022 220 L2153 219 L2181 211 L2193 204 L2205 193 L2215 175 L2219 157 L2220 93 L2218 76 L2213 61 L2199 42 L2178 29 L2144 21 L2023 20 Z M2061 58 L2146 59 L2164 66 L2172 74 L2177 85 L2179 97 L2179 146 L2176 160 L2167 173 L2155 180 L2141 183 L2060 182 Z"/>
        </g>
        <path fill="#ff4f22" d="M1099 28 L1090 37 L1085 46 L1082 67 L1088 87 L1102 105 L1087 114 L1074 126 L1065 141 L1061 156 L1061 172 L1063 181 L1073 200 L1089 214 L1102 220 L1116 223 L1145 224 L1164 221 L1180 214 L1194 202 L1216 222 L1249 222 L1250 219 L1215 184 L1225 168 L1233 150 L1236 137 L1234 135 L1211 135 L1201 160 L1196 165 L1115 81 L1111 71 L1112 60 L1119 51 L1129 47 L1148 47 L1159 51 L1165 57 L1169 67 L1169 76 L1195 76 L1194 55 L1191 46 L1184 35 L1168 23 L1144 18 L1117 20 Z M1091 147 L1095 140 L1104 131 L1119 123 L1178 184 L1169 191 L1153 197 L1127 198 L1109 194 L1099 188 L1091 177 L1088 165 Z"/>
      </svg>
    </span>
  )
}

export default function Page() {
  const [result, setResult] = useState<Capture | null>(null)

  return (
    <main className="min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center gap-2">
              <Glasses className="size-5 text-primary" />
              <span className="font-mono text-sm font-medium uppercase tracking-[0.25em]">
                Optyx
              </span>
            </div>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
            <span className="hidden items-center gap-2 text-muted-foreground sm:inline-flex">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em]">by</span>
              <BrickBondLockup compact />
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <ShieldCheck className="size-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              On-device
            </span>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center border-t border-border/60 px-4 py-2 sm:hidden">
          <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">by</span>
          <span className="text-muted-foreground"><BrickBondLockup compact /></span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]">A Brick & Bond Concept</span>
        </div>
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
              Eight signature silhouettes to browse. Prices shown in Philippine pesos.
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
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Optyx — A Brick & Bond Concept
            </span>
            <span className="text-muted-foreground"><BrickBondLockup compact /></span>
          </div>
        </div>
      </footer>
    </main>
  )
}
