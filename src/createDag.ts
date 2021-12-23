import { inspect } from 'util'

import { Machine } from 'robot3'
import { R3Immediate, R3Machine, R3State, R3Transition } from './types/robot3';
import { R3Dag, R3Edge, R3EdgeKinds, R3Node, R3NodeID } from './types/dag';
import { Guard, Reducer, State } from './nodes';

type NodeMap = Record<string, StateNodes>

type StateNodes = {
  root: R3Node,
  immediatesNodes: TransitionNodes[],
  transitionsNodes: Record<string, TransitionNodes[]>
}

type TransitionNodes = {
  guard?: R3Node,
  reducer?: R3Node,
}

export function createDag(machine: R3Machine): R3Dag {
  const nodeMap: NodeMap = mapRecord(
    machine.states,
    collectStateNodes
  )

  console.warn('nodeMap', inspect(nodeMap, { depth: 8 }))

  const nodes: R3Node[] = Object.values(nodeMap).reduce(
    (acc, item) => {
      const children = [
        ...Object.values(item.transitionsNodes).flat(),
        ...item.immediatesNodes,
      ]

      const childNodes = children.reduce(
        (acc, item) => [
          ...acc,
          item.guard,
          item.reducer
        ],
        [] as (R3Node | undefined)[]
      )

      return [
        ...acc,
        item.root,
        ...childNodes.filter<R3Node>((n): n is R3Node => !!n)
      ]
    },
    [] as R3Node[]
  )

  const edges: R3Edge[] = Object.entries(machine.states).reduce(
    (acc, [stateName, state]) => [
      ...acc,
      ...collectStateEdges(nodeMap, state, stateName)
    ],
    [] as R3Edge[]
  )

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
  )

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
    ...(immediateEdges ? immediateEdges.flat() : []),
    ...Object.values(transitionEdges).flat().reduce(
      (acc, list) => [...acc, ...list],
      [] as R3Edge[]
    )
  ]
}

function collectTransitionEdges(from: R3NodeID, to: R3NodeID, transition: TransitionNodes, triggerKind: R3EdgeKinds) {
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

// function collectImmediateEdges(machine: R3Machine, nodes: NodeMap, state: string, immediateIndex: number) {
//   const definition = machine.states[state].immediates?.[immediateIndex]
//   if (!definition) {
//     return []
//   }
//
//   const immediate: TransitionNodes = nodes[state].immediatesNodes[immediateIndex]
//
//   const fromSource: R3Edge = {
//     from: getStateId(nodes, state),
//     to: immediate.guard?.id || immediate.reducer?.id || getStateId(nodes, definition.to),
//     kind: 'immediate'
//   }
//
//   const fromGuard: R3Edge | undefined = immediate.guard && {
//     from: immediate.guard.id,
//     to: immediate.reducer?.id || getStateId(nodes, definition.to),
//     kind: 'immediate'
//   }
//
//   const fromReducer: R3Edge | undefined = immediate.reducer && {
//     from: immediate.reducer.id,
//     to: getStateId(nodes, definition.to),
//     kind: 'immediate'
//   }
//
//   const candidates = [
//     fromSource,
//     fromGuard,
//     fromReducer
//   ]
//
//   return candidates.filter<R3Edge>((e): e is R3Edge => !!e)
// }


function getStateId(nodeMap: NodeMap, state: string): R3NodeID {
  return nodeMap[state].root.id
}


function mapRecord<T, U>(record: Record<string, T>, fn: (t: T, s: string) => U): Record<string, U> {
  return Object.entries(record).reduce(
    (result, [inputKey, inputVal]) => {
      return {
        ...result,
        [inputKey]: fn(inputVal, inputKey)
      }
    },
    {} as Record<string, U>
  )
}


// To build our tree we'll construct an object tree
// Each object has a dict of edges
// Edges are named

// Each transition will be
// --> |event| --> guard --> |truthy| --> reducer? --> destination
//                       --> |falsy|  --> (nextTransition for this event)
// --> |event| --> reducer? --> destination

// Each immediate will be
// -->guard? --> |truthy| --> reducer? --> destination
//           --> |falsy|  --> (nextGuard || backToSelf)

// Each promise will be
// --> |done| --> map transition
// --> |error| --> map transition
// --> |x| --> map transition

// Each invoked machine will be
// --> |done| --> map transition
// --> |error| --> map transition
// --> delegate: subMachine