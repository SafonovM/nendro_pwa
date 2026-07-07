import { useEffect, useRef, useState } from 'react'
import type { PracticeVisualization } from '../../lib/practiceVisualization'
import { assetExists } from '../../lib/practiceVisualization'

interface PracticeVisualizationSectionProps {
  visualization: PracticeVisualization
}

export function PracticeVisualizationSection({ visualization }: PracticeVisualizationSectionProps) {
  const [posterOk, setPosterOk] = useState(false)
  const [videoOk, setVideoOk] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let cancelled = false
    async function check() {
      const [p, v] = await Promise.all([
        visualization.posterPath ? assetExists(visualization.posterPath) : false,
        visualization.videoPath ? assetExists(visualization.videoPath) : false,
      ])
      if (!cancelled) {
        setPosterOk(p)
        setVideoOk(v)
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [visualization.posterPath, visualization.videoPath])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoOk) return
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.play().catch(() => {})
  }, [videoOk, visualization.videoPath])

  if (!posterOk && !videoOk) {
    return (
      <div className="card p-4">
        <p className="text-sm text-[var(--text-muted)]">Визуализация недоступна</p>
      </div>
    )
  }

  return (
    <div className="card p-3">
      <h3 className="mb-3 font-medium text-[var(--color-primary)]">Визуализация</h3>
      <div className="flex flex-col gap-3">
        {posterOk && visualization.posterPath && (
          <img
            src={visualization.posterPath}
            alt="Постер визуализации"
            className="w-full rounded-xl object-cover"
          />
        )}
        {videoOk && visualization.videoPath && (
          <video
            ref={videoRef}
            src={visualization.videoPath}
            className="w-full rounded-xl"
            controls
            playsInline
            muted
            loop
          />
        )}
      </div>
    </div>
  )
}
