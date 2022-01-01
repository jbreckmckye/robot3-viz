import * as d3 from 'd3'
import * as dagre from 'dagre'
import * as dagreD3 from 'dagre-d3'
import { graphlib } from 'dagre-d3'

import { R3Dag } from './types/dag'

export function getDagre(dag: R3Dag, options: dagre.GraphLabel = {}) {
  const defaultOptions = {
    marginx: 20,
    marginy: 20,
    nodesep: 40,
    edgesep: 40,
    ranksep: 40,
    labelpos: 'c'
  } as dagre.GraphLabel

  const graph = new graphlib.Graph()
    .setGraph({ ...defaultOptions, ...options })
    .setDefaultEdgeLabel(() => ({}))

  for (const node of dag.nodes) {
    graph.setNode(node.id.toString(10), {
      label: node.label,
      class: 'node--' + node.kind
    })
  }

  for (const edge of dag.edges) {
    graph.setEdge(
      edge.from.toString(10),
      edge.to.toString(10),
      {
        label: edge.label ? edge.label : undefined,
        curve: d3.curveBasis,
        class: 'edge--' + edge.kind
      }
    )
  }

  return graph
}

export function renderSVG(graph: graphlib.Graph, root: SVGElement) {
  const render = new dagreD3.render()

  // Create root SVG
  const svg = d3.select(root)
  svg.append('g')

  // Run the renderer. This is what draws the graph
  render(svg.select('g') as any, graph as any)

  const graphHeight = (graph as any)?.graph()?.height
  const graphWidth = (svg.node())?.getBoundingClientRect()?.width

  if (graphHeight) {
    svg.attr('height', graphHeight)
  }

  if (graphWidth) {
    svg.attr('width', graphWidth)
  }

  // Append edge label backgrounds
  const edgeLabels = svg.node()!.querySelectorAll('.edgeLabel .label')
  for (const label of edgeLabels) {
    const { width, height } = label.getBoundingClientRect()
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('class', 'edge--labelBackground')
    rect.setAttribute('width', width.toString(10))
    rect.setAttribute('height', height.toString(10))
    rect.setAttribute('fill', 'white')
    label.prepend(rect)
  }

  return svg
}
