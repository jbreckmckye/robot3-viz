// todo, don't need this, Robot3 already has TS definitions

/**
 * Robot3 state machine
 */
export type R3Machine <C, S extends string, V extends string> = {
  context: () => C,
  current: S,
  states: Record<S, R3State<S, V> | R3Invoke<S, V> | R3Delegate<S, V>>
}

/**
 * Robot3 state node
 */
export type R3State<S, V> = {
  final: boolean,
  transitions: Map<V, R3Transition<S, V>[]>,
  immediates?: R3Immediate<S, V>[]
}

/**
 * State node that invokes a promise, then transitions on done / error
 */
export type R3Invoke<S, V, Transition = V | 'done' | 'error'> = {
  fn: () => Promise<unknown>,
  transitions: Map<Transition, R3Transition<Transition, V>[]>
}

/**
 * State node that invokes another machine, then transitions on done
 */
export type R3Delegate<S, V, Transition = V | 'done'> = {
  machine: R3Machine<unknown, string, string>,
  transitions: Map<Transition, R3Transition<Transition, V>[]>
}

/**
 * Robot3 transition mapping
 */
export type R3Transition<S, V> = {
  from: V,
  to: S,
  guards: R3Guard | R3Truthy,
  reducers: R3Reducer | R3Identity
}

/**
 * Transition guards
 */
export type R3Truthy = { name: 'truthy' } & Function
export type R3Guard = (ctx: unknown) => boolean

/**
 * Transition reducers
 */
export type R3Identity = { name: 'identity' } & Function
export type R3Reducer = (ctx: unknown, ev: unknown) => unknown


/**
 * 'Immediate' transition
 */
export type R3Immediate<S, V> = R3Transition<S, V> & { from: null }