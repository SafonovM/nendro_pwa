interface TibetanAProps {
  size?: number
  className?: string
}

export function TibetanA({ size = 48, className = '' }: TibetanAProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="100" height="100" rx="20" fill="#1A3A6B" />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontSize="52"
        fill="#D4A853"
        fontFamily="serif"
      >
        ཨ
      </text>
    </svg>
  )
}
