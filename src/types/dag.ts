export type R3NodeKinds =
  | 'state'
  | 'guard'
  | 'reduce'
  | 'invoke-machine'
  | 'invoke-promise'
  | 'action'

export type R3NodeID = { __brand: "R3NodeID" } & number

export type R3EdgeKinds =
  | 'event'
  | 'immediate'
  | 'side-effect'

export type R3Edge = {
  from: R3NodeID,
  to: R3NodeID,
  kind: R3EdgeKinds,
  label?: string
}

export type R3Node = {
  kind: R3NodeKinds,
  delegate?: R3Dag, // Some nodes will delegate to another machine (via invoke)
  label: string,
  id: R3NodeID
}

export type R3Dag = {
  nodes: R3Node[],
  edges: R3Edge[],
}
