import type { FaceShape } from './face-shape'

export type Frame = {
  id: string
  name: string
  style: string
  price: number
  image: string
  material: string
  description: string
  bestFor: FaceShape[]
}

export const FRAMES: Frame[] = [
  {
    id: 'round-metal',
    name: 'Halo',
    style: 'Round',
    price: 145,
    image: '/frames/round-metal.png',
    material: 'Gold-toned metal',
    description: 'Featherweight wire rims with a timeless circular silhouette.',
    bestFor: ['Square', 'Oblong', 'Heart'],
  },
  {
    id: 'rectangle-acetate',
    name: 'Ledger',
    style: 'Rectangle',
    price: 125,
    image: '/frames/rectangle-acetate.png',
    material: 'Tortoiseshell acetate',
    description: 'Bold rectangular rims that add structure and definition.',
    bestFor: ['Round', 'Oval'],
  },
  {
    id: 'cat-eye',
    name: 'Vera',
    style: 'Cat-eye',
    price: 165,
    image: '/frames/cat-eye.png',
    material: 'Matte black acetate',
    description: 'Upswept corners that lift and flatter the eyes.',
    bestFor: ['Round', 'Diamond', 'Oval'],
  },
  {
    id: 'aviator',
    name: 'Falcon',
    style: 'Aviator',
    price: 155,
    image: '/frames/aviator.png',
    material: 'Silver metal',
    description: 'Classic teardrop rims with a light double bridge.',
    bestFor: ['Heart', 'Square', 'Oval'],
  },
  {
    id: 'browline',
    name: 'Dean',
    style: 'Browline',
    price: 135,
    image: '/frames/browline.png',
    material: 'Acetate + metal',
    description: 'A strong upper brow paired with a barely-there lower rim.',
    bestFor: ['Round', 'Oblong', 'Oval'],
  },
  {
    id: 'oversized-square',
    name: 'Atlas',
    style: 'Oversized Square',
    price: 175,
    image: '/frames/oversized-square.png',
    material: 'Amber acetate',
    description: 'Generously sized rims with warm translucent color.',
    bestFor: ['Oval', 'Diamond', 'Oblong'],
  },
  {
    id: 'geometric-hex',
    name: 'Prism',
    style: 'Hexagonal',
    price: 150,
    image: '/frames/geometric-hex.png',
    material: 'Gunmetal wire',
    description: 'Angular hexagon rims for a sharp, modern edge.',
    bestFor: ['Round', 'Oval', 'Oblong'],
  },
  {
    id: 'rimless-oval',
    name: 'Ghost',
    style: 'Rimless',
    price: 185,
    image: '/frames/rimless-oval.png',
    material: 'Rimless titanium',
    description: 'Frameless lenses with whisper-thin arms and bridge.',
    bestFor: ['Square', 'Diamond', 'Heart'],
  },
]

export function getRecommendations(shape: FaceShape): Frame[] {
  const matches = FRAMES.filter((f) => f.bestFor.includes(shape))
  if (matches.length >= 3) return matches
  const fillers = FRAMES.filter((f) => !f.bestFor.includes(shape))
  return [...matches, ...fillers].slice(0, 3)
}
