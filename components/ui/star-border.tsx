"use client"

import type React from "react"

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T
  className?: string
  children?: React.ReactNode
  color?: string
  speed?: React.CSSProperties["animationDuration"]
  thickness?: number
}

const StarBorder = <T extends React.ElementType = "div">({
  as,
  className = "",
  color = "cyan",
  speed = "5s",
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "div"

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] w-full ${className}`}
      {...(rest as any)}
      style={{
        padding: `${thickness}px`,
        ...(rest as any).style,
      }}
    >
      <div
        className="absolute w-[400%] h-[80%] opacity-80 bottom-[-40px] right-[-300%] rounded-full animate-star-movement-bottom z-0 blur-xl"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 15%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[400%] h-[80%] opacity-80 top-[-40px] left-[-300%] rounded-full animate-star-movement-top z-0 blur-xl"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 15%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-10 bg-card/95 rounded-[18px]">{children}</div>
    </Component>
  )
}

export default StarBorder
