"use client"

import { useEffect, useRef } from "react"

interface AnimatedGrayBlobsProps {
  className?: string
}

export default function AnimatedGrayBlobs({ className = "" }: AnimatedGrayBlobsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match container
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    // Initial resize
    resizeCanvas()

    // Re-resize on window changes
    window.addEventListener("resize", resizeCanvas)

    // Blob class
    class Blob {
      x: number
      y: number
      radius: number
      xSpeed: number
      ySpeed: number
      opacity: number
      growing: boolean

      constructor(x: number, y: number, radius: number) {
        this.x = x
        this.y = y
        this.radius = radius
        this.xSpeed = (Math.random() - 0.5) * 0.5
        this.ySpeed = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.07 + 0.03 // Very subtle: between 0.03 and 0.1
        this.growing = Math.random() > 0.5
      }

      update(width: number, height: number) {
        // Move the blob
        this.x += this.xSpeed
        this.y += this.ySpeed

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.xSpeed *= -1
        if (this.y < 0 || this.y > height) this.ySpeed *= -1

        // Grow and shrink slowly
        if (this.growing) {
          this.radius += 0.2
          if (this.radius > this.radius * 1.2) this.growing = false
        } else {
          this.radius -= 0.2
          if (this.radius < this.radius * 0.8) this.growing = true
        }

        // Ensure minimum radius
        if (this.radius < 50) this.radius = 50
      }

      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(
          this.x, 
          this.y, 
          0, 
          this.x, 
          this.y, 
          this.radius
        )
        
        gradient.addColorStop(0, `rgba(160, 160, 160, ${this.opacity})`) // Mid-gray with variable opacity
        gradient.addColorStop(1, 'rgba(180, 180, 180, 0)') // Fade to transparent

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create blobs
    const blobs: Blob[] = []
    const blobCount = 6 // More blobs for a richer pattern

    // Initialize blobs
    for (let i = 0; i < blobCount; i++) {
      const { width, height } = canvas.getBoundingClientRect()
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = Math.random() * 100 + 150 // Bigger blobs
      blobs.push(new Blob(x, y, radius))
    }

    // Animation loop
    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect()
      
      // Clear canvas 
      ctx.clearRect(0, 0, width, height)

      // Update and draw blobs
      blobs.forEach(blob => {
        blob.update(width, height)
        blob.draw(ctx)
      })

      requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  )
}