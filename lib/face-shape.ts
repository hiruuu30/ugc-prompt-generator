// Face shape classification from MediaPipe FaceLandmarker output.
// Landmarks are the 478-point mesh; each point has normalized x/y/z in [0,1].

export type FaceShape =
  | 'Oval'
  | 'Round'
  | 'Square'
  | 'Oblong'
  | 'Heart'
  | 'Diamond'

export type Landmark = { x: number; y: number; z: number }

export type Measurements = {
  faceLength: number
  cheekboneWidth: number
  jawWidth: number
  foreheadWidth: number
  lengthToWidth: number
  foreheadToCheek: number
  jawToCheek: number
  jawToForehead: number
}

export type ShapeScore = { shape: FaceShape; score: number }

export type FaceShapeResult = {
  shape: FaceShape
  confidence: number
  scores: ShapeScore[]
  measurements: Measurements
}

// Key mesh indices along the face oval.
const IDX = {
  foreheadTop: 10,
  chin: 152,
  templeLeft: 21,
  templeRight: 251,
  cheekLeft: 234,
  cheekRight: 454,
  jawLeft: 172,
  jawRight: 397,
}

function dist(
  a: Landmark,
  b: Landmark,
  w: number,
  h: number,
): number {
  // Convert normalized coords to pixel space so ratios aren't distorted
  // by non-square video dimensions.
  const dx = (a.x - b.x) * w
  const dy = (a.y - b.y) * h
  return Math.hypot(dx, dy)
}

export function computeMeasurements(
  lm: Landmark[],
  w: number,
  h: number,
): Measurements {
  const faceLength = dist(lm[IDX.foreheadTop], lm[IDX.chin], w, h)
  const foreheadWidth = dist(lm[IDX.templeLeft], lm[IDX.templeRight], w, h)
  const cheekboneWidth = dist(lm[IDX.cheekLeft], lm[IDX.cheekRight], w, h)
  const jawWidth = dist(lm[IDX.jawLeft], lm[IDX.jawRight], w, h)

  return {
    faceLength,
    cheekboneWidth,
    jawWidth,
    foreheadWidth,
    lengthToWidth: faceLength / cheekboneWidth,
    foreheadToCheek: foreheadWidth / cheekboneWidth,
    jawToCheek: jawWidth / cheekboneWidth,
    jawToForehead: jawWidth / foreheadWidth,
  }
}

// Feature = [lengthToWidth, foreheadToCheek, jawToCheek].
// Each shape has an ideal profile; we score by weighted distance and
// convert to a softmax-style confidence.
const TARGETS: Record<FaceShape, [number, number, number]> = {
  Oval: [1.5, 0.88, 0.8],
  Round: [1.03, 0.93, 0.88],
  Square: [1.08, 0.97, 0.97],
  Oblong: [1.65, 0.92, 0.88],
  Heart: [1.35, 1.02, 0.68],
  Diamond: [1.45, 0.8, 0.72],
}

const WEIGHTS: [number, number, number] = [1.0, 0.85, 0.95]

export function classifyFaceShape(m: Measurements): FaceShapeResult {
  const f: [number, number, number] = [
    m.lengthToWidth,
    m.foreheadToCheek,
    m.jawToCheek,
  ]

  const raw = (Object.keys(TARGETS) as FaceShape[]).map((shape) => {
    const t = TARGETS[shape]
    let d = 0
    for (let i = 0; i < 3; i++) {
      const diff = f[i] - t[i]
      d += WEIGHTS[i] * diff * diff
    }
    d = Math.sqrt(d)
    return { shape, weight: Math.exp(-d * 4) }
  })

  const total = raw.reduce((s, r) => s + r.weight, 0) || 1
  const scores: ShapeScore[] = raw
    .map((r) => ({ shape: r.shape, score: r.weight / total }))
    .sort((a, b) => b.score - a.score)

  return {
    shape: scores[0].shape,
    confidence: scores[0].score,
    scores,
    measurements: m,
  }
}

export const SHAPE_INFO: Record<
  FaceShape,
  { description: string; tip: string }
> = {
  Oval: {
    description:
      'Balanced proportions with a gently rounded jaw and forehead slightly wider than the chin. The most versatile shape.',
    tip: 'Almost anything works — lean into frames as wide as the broadest part of your face to keep the balance.',
  },
  Round: {
    description:
      'Soft curves with similar width and length and full cheeks. Angular frames add definition and structure.',
    tip: 'Choose angular, rectangular, or geometric frames to lengthen and sharpen soft features.',
  },
  Square: {
    description:
      'Strong, angular jaw with forehead, cheeks, and jaw close in width. Rounded frames soften the strong lines.',
    tip: 'Round and oval frames add contrast and take the edge off a defined jawline.',
  },
  Oblong: {
    description:
      'Longer than it is wide with fairly even width top to bottom. Frames with depth and detail add balancing width.',
    tip: 'Pick taller, decorative, or oversized frames to break up the length and add width.',
  },
  Heart: {
    description:
      'Wider forehead and cheekbones that taper to a narrow chin. Frames that are wider at the bottom restore balance.',
    tip: 'Bottom-heavy, rimless, or light metal frames draw attention down and away from the forehead.',
  },
  Diamond: {
    description:
      'Narrow forehead and jaw with dramatic, wide cheekbones. Frames with detailed or expressive brow lines shine.',
    tip: 'Cat-eye, oval, and rimless frames highlight the eyes and soften the cheekbones.',
  },
}
