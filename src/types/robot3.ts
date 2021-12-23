type FnNamed <T> = Function & { name: T }

type ReducerFn = FnNamed<undefined> | FnNamed<'identity'>
type GuardFn = FnNamed<undefined> | FnNamed<'truthy'>

export type R3Machine = {
  current: string,
  states: Record<string, R3State | R3StateWMachine | R3StateWPromise>
}

export type R3State = {
  final: boolean,
  transitions: Map<string, R3Transition[]>,
  immediates?: R3Immediate[]
}

export type R3Immediate = {
  from: null,
  to: string,
  guards: GuardFn,
  reducers: ReducerFn
}

export type R3StateWPromise = R3State & {
  fn: () => Promise<any>,
  transitions: Map<string | 'done' | 'error', R3Transition>
}

export type R3StateWMachine =  R3State & {
  transitions: Map<string | 'done', R3Transition>,
  machine: R3Machine
}

export type R3Transition = {
  from: string,
  to: string,
  guards: GuardFn,
  reducers: ReducerFn
}
