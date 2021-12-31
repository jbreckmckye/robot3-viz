import { Machine } from 'robot3'

import { getDAG } from './dag'
import { getDagre, renderSVG } from './viz'

export {
  getDAG,
  getDagre
}

export function robot3viz (input: Machine, svg: SVGElement) {
  const dag = getDAG(input)
  const dagre = getDagre(dag)
  return renderSVG(dagre, svg).node() as unknown as SVGElement
}
