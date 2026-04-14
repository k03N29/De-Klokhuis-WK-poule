interface KlokFlesjeProps {
  size?: number
  dimmed?: boolean
}

export default function KlokFlesje({ size = 32, dimmed = false }: KlokFlesjeProps) {
  const height = size
  const width = Math.round(size * 0.42) // fles is smal

  return (
    <img
      src="/deklok-fles.png"
      alt="De Klok flesje"
      width={width}
      height={height}
      style={{
        opacity: dimmed ? 0.2 : 1,
        display: 'inline-block',
        flexShrink: 0,
        objectFit: 'contain',
        imageRendering: 'auto',
      }}
    />
  )
}
