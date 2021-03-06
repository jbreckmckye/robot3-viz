import { Machine } from 'robot3'
import * as dagre from 'dagre'

import { getDAG } from './dag'
import { clearSVG, getDagre, renderSVG } from './viz'

export {
  getDAG,
  getDagre
}

export function robot3viz (input: Machine, svg: SVGElement, options?: dagre.GraphLabel) {
  const dag = getDAG(input)
  const dagre = getDagre(dag, options)
  clearSVG(svg)
  return renderSVG(dagre, svg).node() as unknown as SVGElement
}
