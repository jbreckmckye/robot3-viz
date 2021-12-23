import { R3Node, R3NodeID } from './types/dag';

function ID() {
  const self = ID as unknown as { x: number }
  const lastValue = self.x || 0
  return self.x = lastValue + 1 as R3NodeID
}

export const State = (name: string): R3Node => ({
  kind: 'state',
  label: name,
  id: ID()
})

export const Guard = (name: string): R3Node => ({
  kind: 'guard',
  label: name,
  id: ID()
})

export const Reducer = (name: string): R3Node => ({
  kind: 'reduce',
  label: name,
  id: ID()
})
