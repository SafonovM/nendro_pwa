import { useEffect, useRef, useState } from 'react'
import type { PracticeVisualization } from '../../lib/practiceVisualization'
import { assetExists } from '../../lib/practiceVisualization'

interface PracticeVisualizationSectionProps {
  visualization: PracticeVisualization
}

function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.play().catch(() => {})
  }, [src])

  return (
    <video
      ref={videoRef}
      src={src}
      className="w-full rounded-xl"
      controls
      playsInline
      muted
      loop
    />
  )
}

export function PracticeVisualizationSection({ visualization }: PracticeVisualizationSectionProps) {
  const [posterOk, setPosterOk] = useState(false)
  const [availableVideos, setAvailableVideos] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    async function check() {
      const posterResult = visualization.posterPath
        ? await assetExists(visualization.posterPath)
        : false
      const videoResults = await Promise.all(
        visualization.videoPaths.map(async (path) => ((await assetExists(path)) ? path : null)),
      )
      if (!cancelled) {
        setPosterOk(posterResult)
        setAvailableVideos(videoResults.filter((p): p is string => p != null))
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [visualization.posterPath, visualization.videoPaths])

  if (!posterOk && availableVideos.length === 0) {
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
        {availableVideos.map((path) => (
          <VideoPlayer key={path} src={path} />
        ))}
      </div>
    </div>
  )
}
