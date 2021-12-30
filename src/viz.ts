import * as d3 from 'd3'
import * as dagre from 'dagre-d3'
import { graphlib } from 'dagre-d3'

import { R3Dag } from './types/dag'

export function getDagre(dag: R3Dag) {
  const graph = new graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(() => ({}))

  for (const node of dag.nodes) {
    graph.setNode(node.id.toString(10), {
      label: node.label,
      class: node.kind
    })
  }

  for (const edge of dag.edges) {
    graph.setEdge(
      edge.from.toString(10),
      edge.to.toString(10),
      edge.label
    )
  }

  return graph
}

export function renderSVG(graph: graphlib.Graph, doc: Document = global.document) {
  const render = new dagre.render()

  // Create root SVG
  const svg = d3.select(document.createElement('svg'))

  // Run the renderer. This is what draws the graph
  render(svg as any, graph as any)

  const graphHeight = (graph as any)?.graph()?.height
  const graphWidth = (svg.node())?.getBoundingClientRect()?.width

  if (graphHeight) {
    svg.attr('height', graphHeight)
  }

  if (graphWidth) {
    svg.attr('width', graphWidth)
  }

  return svg
}