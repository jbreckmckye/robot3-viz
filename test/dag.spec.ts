import { inspect } from 'util'

import { getDAG, getNodesForTransition } from '../src/dag'

import {
  actioned,
  guards,
  immediates,
  invokeMachines,
  invokePromises,
  reducers,
  transitions
} from './machines/features'
import { R3Machine, R3Transition } from '../src/types/robot3';
import { R3Edge, R3Node } from '../src/types/dag';

describe('getDAG', () => {
  function $findNode(nodes: R3Node[]) {
    return (label: string) =>
      nodes.find(node => node.label === label)?.id
  }

  function countNodes(nodes: R3Node[], count: number) {
    expect(nodes.length).toBe(count)
  }

  function $hasNode(nodes: R3Node[]) {
    return (node: Partial<R3Node>) => {
      expect(nodes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            ...node
          })
        ])
      )
    }
  }
  
  function $findGuard(nodes: R3Node[]) {
    return (index: number) => nodes.filter(node => node.kind === 'guard')[index]?.id
  }

  function countEdges(edges: R3Edge[], count: number) {
    expect(edges.length).toBe(count)
  }
  
  function $hasEdge(edges: R3Edge[]) {
    return (edge: Partial<R3Edge>) => {
      expect(edges).toEqual(
        expect.arrayContaining([
          expect.objectContaining(edge)
        ])
      )
    }
  }

  describe('given the example "transitions" machine', () => {
    const { nodes, edges } = getDAG(transitions)
    const findNode = $findNode(nodes)
    const hasNode = $hasNode(nodes)
    const hasEdge = $hasEdge(edges)

    it('finds the correct nodes', () => {
      countNodes(nodes, 2)
      hasNode({
        kind: 'state',
        label: 'inactive'
      })
      hasNode({
        kind: 'state',
        label: 'active'
      })
    })

    it('finds the correct edges', () => {
      countEdges(edges, 2)
      hasEdge({
        from: findNode('inactive'),
        to: findNode('active'),
        kind: 'event',
        label: 'toggle'
      })
      hasEdge({
        from: findNode('active'),
        to: findNode('inactive'),
        kind: 'event',
        label: 'toggle'
      })
    })
  })

  describe('given the example "guards" machine', () => {
    const { nodes, edges } = getDAG(guards)
    const findNode = $findNode(nodes)
    const hasNode = $hasNode(nodes)
    const findGuard = $findGuard(nodes)
    const hasEdge = $hasEdge(edges)

    it ('finds the correct nodes', () => {
      countNodes(nodes, 7)
      hasNode({
        kind: 'state',
        label: 'chooseMove'
      })
      hasNode({
        kind: 'guard',
        label: 'guard'
      })
      hasNode({
        kind: 'state',
        label: 'attacking'
      })
      hasNode({
        kind: 'state',
        label: 'healing'
      })
      hasNode({
        kind: 'state',
        label: 'enemyTurn'
      })
      hasNode({
        kind: 'guard',
        label: 'guard'
      })
      hasNode({
        kind: 'state',
        label: 'defeated'
      })
    })

    it('finds the correct edges', () => {
      countEdges(edges, 8)
      hasEdge({
        from: findNode('chooseMove'),
        to: findGuard(0),
        kind: 'event',
        label: 'next'
      })
      hasEdge({
        from: findGuard(0),
        to: findNode('healing'),
        kind: 'immediate'
      })
      hasEdge({
        from: findNode('chooseMove'),
        to: findNode('attacking'),
        kind: 'event',
        label: 'next'
      })
      hasEdge({
        from: findNode('attacking'),
        to: findNode('enemyTurn'),
        kind: 'event',
        label: 'next'
      })
      hasEdge({
        from: findNode('healing'),
        to: findNode('enemyTurn'),
        kind: 'event',
        label: 'next'
      })
      hasEdge({
        from: findNode('enemyTurn'),
        to: findGuard(1),
        kind: 'event',
        label: 'takeAttack'
      })
      hasEdge({
        from: findGuard(1),
        to: findNode('defeated'),
        kind: 'immediate'
      })
      hasEdge({
        from: findNode('enemyTurn'),
        to: findNode('chooseMove'),
        kind: 'event',
        label: 'next'
      })
    })
  })
})

describe('getNodesForTransition', () => {
  function truthy () {}
  function identity () {}

  const baseInput: R3Transition = {
    from: 'from',
    to: 'to',
    guards: truthy,
    reducers: identity
  }

  it('includes a Guard node if guardFn is user-supplied', () => {
    const input: R3Transition = {
      ...baseInput,
      guards: () => {}
    }
    expect(getNodesForTransition(input)).toEqual(
      expect.objectContaining({
        guard: {
          kind: 'guard',
          label: 'guardFn',
          id: expect.any(Number)
        }
      })
    )
  })

  it('includes a Reducer node if reducerFn is not the inbuilt "identity"', () => {
    const input: R3Transition = {
      ...baseInput,
      reducers: () => {}
    }
    expect(getNodesForTransition(input)).toEqual(
      expect.objectContaining({
        reducer: {
          kind: 'reduce',
          label: 'reducer',
          id: expect.any(Number)
        }
      })
    )
  })

  it('includes neither Guard nor Reducer node if guardFn & reducerFn are just the inbuilts', () => {
    // By default all Robot3 transition structs have a guard and reducer function
    expect(getNodesForTransition(baseInput)).toEqual(
      expect.objectContaining({
        guard: undefined,
        reducer: undefined
      })
    )
  })
})
