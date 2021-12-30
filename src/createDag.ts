import type { Machine } from 'robot3'

import { R3Immediate, R3Machine, R3State, R3Transition } from './types/robot3'
import { NodeMap, R3Dag, R3Edge, R3EdgeKinds, R3Node, R3NodeID, StateNodes, TransitionNodes } from './types/dag'
import { Guard, Reducer, State } from './nodes'
import { mapRecord } from './util'

/**
 * For a given Robot3 machine, return an R3Dag structure for consumption by a visualisation library
 */
export function createDag(input: Machine | R3Machine): R3Dag {
  /**
   * The inbuilt Robot3 types aren't quite detailed enough for this analysis, so we have to coerce to our own types
   */
  const machine = input as R3Machine

  /**
   * Create a tree of states and child states (like reducers, guards, etc.)
   */
  const nodeMap: NodeMap = mapRecord(
    machine.states,
    collectStateNodes
  )

  /**
   * Use the node tree to build a flattened node list
   * This is needed by DAGRE
   */
  const nodes: R3Node[] = Object.values(nodeMap).reduce(
    (acc, stateNodes) => {
      const stateNode = stateNodes.root

      const stateTransitions: TransitionNodes[] = [
        ...Object.values(stateNodes.transitionsNodes).flat(),
        ...stateNodes.immediatesNodes,
      ]

      const childNodes = stateTransitions.reduce(
        (acc, item) => [
          ...acc,
          item.guard,
          item.reducer
        ],
        [] as (R3Node | undefined)[]
      ).filter<R3Node>((n): n is R3Node => !!n)

      return [
        ...acc,
        stateNode,
        ...childNodes
      ]
    },
    [] as R3Node[]
  )

  /**
   * Using the state branches in the machine, construct a set of edges between states and child states
   * These will describe all the connections within the state machine
   */
  const edges: R3Edge[] = Object.entries(machine.states).reduce(
    (acc, [stateName, state]) => [
      ...acc,
      ...collectStateEdges(nodeMap, state, stateName)
    ],
    [] as R3Edge[]
  )

  /**
   * To create a visualisation, DAGRE requires a list of nodes and edges
   */
  return {
    nodes,
    edges
  }
}

/**
 * Given a Robot3 state struct, gather the visualisation nodes
 * This will give us structs for its transitions (or immediates) and their associated nodes
 */
function collectStateNodes(state: R3State, stateName: string): StateNodes {
  const root = State(stateName)

  const immediatesNodes = state.immediates?.map(
    collectTransitionNodes
  ) || []

  const transitionsNodes = mapRecord(
    Object.fromEntries(state.transitions),
    transitions => transitions.map(collectTransitionNodes)
  )

  return {
    root,
    immediatesNodes,
    transitionsNodes
  }
}

/**
 * Given a transition (or immediate), gather the child visualisation nodes
 * This will give us a struct for any guard / reducer functions on the way
 */
function collectTransitionNodes(transition: R3Transition | R3Immediate): TransitionNodes {
  const { guards, reducers } = transition

  const hasGuard = guards && guards.name !== 'truthy'
  const hasReducer = reducers && reducers.name !== 'identity'

  return {
    guard: hasGuard ? Guard('guardFn') : undefined,
    reducer: hasReducer ? Reducer('reducerFn') : undefined
  }
}

function collectStateEdges(nodes: NodeMap, state: R3State, stateName: string): R3Edge[] {
  const immediateEdges = state.immediates?.map(
    (immediate, index) => collectTransitionEdges(
      getStateId(nodes, stateName),
      getStateId(nodes, immediate.to),
      nodes[stateName].immediatesNodes[index],
      'immediate'
    )
  ).flat() || []

  const transitionEdges = mapRecord(
    nodes[stateName].transitionsNodes,
    (transitions, event) =>
        transitions.map((transition, index) => collectTransitionEdges(
          getStateId(nodes, stateName),
          getStateId(nodes, state.transitions.get(event)![index].to),
          transition,
          'event'
        ))
  )

  return [
    ...immediateEdges,
    ...Object.values(transitionEdges).flat().reduce(
      (acc, list) => [...acc, ...list],
      [] as R3Edge[]
    )
  ]
}

function collectTransitionEdges(from: R3NodeID, to: R3NodeID, transition: TransitionNodes, triggerKind: R3EdgeKinds) {
  /**
   * Potential chain is
   * fromState --> guardFn --> reducerFn --> destinationState
   */

  const fromSource: R3Edge = {
    from,
    to: transition.guard?.id || transition.reducer?.id || to,
    kind: triggerKind
  }

  const fromGuard: R3Edge | undefined = transition.guard && {
    from: transition.guard.id,
    to: transition.reducer?.id || to,
    kind: 'immediate',
  }

  const fromReducer: R3Edge | undefined = transition.reducer && {
    from: transition.reducer.id,
    to,
    kind: 'immediate'
  }

  const candidates = [
    fromSource,
    fromGuard,
    fromReducer
  ]

  return candidates.filter<R3Edge>((e): e is R3Edge => !!e)
}

function getStateId(nodeMap: NodeMap, state: string): R3NodeID {
  return nodeMap[state].root.id
}
