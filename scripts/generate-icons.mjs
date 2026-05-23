import { writeFileSync } from 'fs'
import { createCanvas } from 'canvas'

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#1976d2'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.18)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = `bold ${size * 0.55}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('¥', size / 2, size / 2)

  return canvas.toBuffer('image/png')
}

try {
  writeFileSync('public/pwa-192x192.png', generateIcon(192))
  writeFileSync('public/pwa-512x512.png', generateIcon(512))
  writeFileSync('public/apple-touch-icon.png', generateIcon(180))
  console.log('Icons generated successfully')
} catch (e) {
  console.log('Install canvas package first: npm install canvas')
  console.log('Or manually create PNG icons and place them in public/')
}
