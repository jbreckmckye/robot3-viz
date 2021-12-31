import React, { CSSProperties, useEffect, useRef } from 'react'
import { Machine } from 'robot3'

import { robot3viz } from '../index'

type Props = {
  style?: CSSProperties,
  fsm: Machine
}

export function Robot3Viz(props: Props) {
  const svg = useRef<SVGSVGElement>(null)

  const svgStyle = {
    display: 'block',
    width: '100%',
    border: 0,
    padding: 0,
    margin: 'auto'
  }

  useEffect(() => {
    if (!svg.current) return

    robot3viz(props.fsm, svg.current)

  }, [svg.current])

  return (
    <svg
      ref={svg}
      className='robot3viz'
      style={{
        ...svgStyle,
        ...props.style
      }}
    />
  )
}