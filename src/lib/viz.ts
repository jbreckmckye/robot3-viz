import * as d3 from 'd3'
import * as dagre from 'dagre'
import * as dagreD3 from 'dagre-d3'
import { graphlib } from 'dagre-d3'

import { R3Dag } from '../types/dag'

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

export function clearSVG(root: SVGElement) {
  for (const child of root.childNodes) {
    root.removeChild(child)
  }
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

  styleSVG(svg.node()!)

  return svg
}

function styleSVG (svg: SVGElement) {
  svg.classList.add('robot3-viz')

  // Append edge label backgrounds
  const edgeLabels = svg.querySelectorAll('.edgeLabel .label')
  for (const label of edgeLabels) {
    const { width, height } = label.getBoundingClientRect()
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    setAttrs(rect, {
      class: 'edge--labelBkg',
      width: width.toString(),
      height: height.toString(),
      fill: 'white'
    })

    label.prepend(rect)
  }

  setAttrs(
    svg,
    {
      'font-weight': '300',
      'font-family': '"Helvetica Neue", Helvetica, HelveticaNeue, Arial, sans-serif',
      'font-size': '16px'
    }
  )

  setAttrs(
    svg.querySelectorAll('rect'),
    {
      fill: '#fff'
    }
  )

  setAttrs(
    svg.querySelectorAll('.node--state rect'),
    {
      stroke: '#333',
      'border-radius': '50%',
      'stroke-width': '2px'
    }
  )

  setAttrs(
    [
      ...svg.querySelectorAll('.node--guard text'),
      ...svg.querySelectorAll('.node--reduce text')
    ],
    {
      'font-style': 'italic'
    }
  )

  setAttrs(
    svg.querySelectorAll('.edgePath path'),
    {
      stroke: '#333',
      'stroke-width': '2px'
    }
  )

}

function setAttrs(els: SVGElement | NodeListOf<SVGElement> | Element[], attrs: Record<string, string>) {
  const elements =
    els instanceof NodeList ? Array.from(els) :
    Array.isArray(els) ? els :
    [els]

  const entries = Object.entries(attrs)

  for (const element of elements) {
    for (const [key, value] of entries) {
      element.setAttribute(key, value)
    }
  }
}