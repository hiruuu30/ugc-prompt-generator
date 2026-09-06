'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from '@mediapipe/tasks-vision'
import { Button } from '@/components/ui/button'
import {
  classifyFaceShape,
  computeMeasurements,
  type FaceShapeResult,
  type Landmark,
} from '@/lib/face-shape'
import { Camera, Loader2, ScanFace, TriangleAlert } from 'lucide-react'

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

type Status = 'idle' | 'loading' | 'streaming' | 'error'

export type Capture = FaceShapeResult & { snapshot: string }

export function FaceScanner({ onAnalyze }: { onAnalyze: (c: Capture) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const landmarkerRef = useRef<FaceLandmarker | null>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const latestRef = useRef<Landmark[] | null>(null)
  const lastVideoTimeRef = useRef(-1)

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string>('')
  const [faceDetected, setFaceDetected] = useState(false)

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => stop, [stop])

  const renderLoop = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current
    if (!video || !canvas || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(renderLoop)
      return
    }

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const now = performance.now()
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime
      const result = landmarker.detectForVideo(video, now)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const marks = result.faceLandmarks?.[0]
      if (marks) {
        latestRef.current = marks as Landmark[]
        setFaceDetected(true)
        const utils = new DrawingUtils(ctx)
        utils.drawConnectors(marks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
          color: 'rgba(232, 197, 130, 0.85)',
          lineWidth: 2,
        })
        utils.drawConnectors(
          marks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: 'rgba(232, 197, 130, 0.12)', lineWidth: 1 },
        )
      } else {
        latestRef.current = null
        setFaceDetected(false)
      }
    }

    rafRef.current = requestAnimationFrame(renderLoop)
  }, [])

  const start = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
      let landmarker: FaceLandmarker
      try {
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      } catch {
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      }
      landmarkerRef.current = landmarker

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setStatus('streaming')
      rafRef.current = requestAnimationFrame(renderLoop)
    } catch (err) {
      console.log('[v0] scanner start error:', (err as Error).message)
      setError(
        (err as Error).name === 'NotAllowedError'
          ? 'Camera access was denied. Enable camera permission and try again.'
          : 'Could not start the camera or load the model. Check your connection and permissions.',
      )
      setStatus('error')
    }
  }, [renderLoop])

  const capture = useCallback(() => {
    const video = videoRef.current
    const marks = latestRef.current
    if (!video || !marks) return

    const measurements = computeMeasurements(
      marks,
      video.videoWidth,
      video.videoHeight,
    )
    const result = classifyFaceShape(measurements)

    const snap = document.createElement('canvas')
    snap.width = video.videoWidth
    snap.height = video.videoHeight
    const sctx = snap.getContext('2d')
    let snapshot = ''
    if (sctx) {
      // Mirror to match the on-screen preview.
      sctx.translate(snap.width, 0)
      sctx.scale(-1, 1)
      sctx.drawImage(video, 0, 0, snap.width, snap.height)
      snapshot = snap.toDataURL('image/jpeg', 0.85)
    }

    onAnalyze({ ...result, snapshot })
  }, [onAnalyze])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-black">
        {/* Video + overlay are CSS-mirrored together for a natural preview */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        />

        {/* Corner reticle */}
        {status === 'streaming' && (
          <div className="pointer-events-none absolute inset-4">
            {[
              'left-0 top-0 border-l-2 border-t-2',
              'right-0 top-0 border-r-2 border-t-2',
              'left-0 bottom-0 border-l-2 border-b-2',
              'right-0 bottom-0 border-r-2 border-b-2',
            ].map((c) => (
              <span
                key={c}
                className={`absolute h-6 w-6 rounded-[3px] border-primary/70 ${c}`}
              />
            ))}
            <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm">
              <span className={faceDetected ? 'text-primary' : 'text-muted-foreground'}>
                {faceDetected ? '● face locked' : '○ align your face'}
              </span>
            </div>
          </div>
        )}

        {status !== 'streaming' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            {status === 'idle' && (
              <>
                <ScanFace className="size-10 text-primary" strokeWidth={1.25} />
                <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
                  Everything runs on-device — your camera feed never leaves this
                  browser.
                </p>
              </>
            )}
            {status === 'loading' && (
              <>
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Loading ML model…
                </p>
              </>
            )}
            {status === 'error' && (
              <>
                <TriangleAlert className="size-8 text-destructive" />
                <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
                  {error}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {status === 'streaming' ? (
          <Button
            onClick={capture}
            disabled={!faceDetected}
            className="flex-1 font-mono text-xs uppercase tracking-widest"
          >
            <ScanFace className="size-4" />
            Analyze face shape
          </Button>
        ) : (
          <Button
            onClick={start}
            disabled={status === 'loading'}
            className="flex-1 font-mono text-xs uppercase tracking-widest"
          >
            <Camera className="size-4" />
            {status === 'error' ? 'Retry camera' : 'Start camera'}
          </Button>
        )}
      </div>
    </div>
  )
}
