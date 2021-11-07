import { createMachine, action, immediate, invoke, guard, reduce, state, transition } from 'robot3';

export const transitions = createMachine({
  inactive: state(
    transition('toggle', 'active')
  ),
  active: state(
    transition('toggle', 'inactive')
  )
});

export const finalState = createMachine({
  pending: state(
    transition('done', 'finished')
  ),
  finished: state()
});

export const guards = createMachine({
  chooseMove: state(
    transition('next', 'healing', guard(function amHurt(ctx) { return true })),
    transition('next', 'attacking')
  ),
  attacking: state(
    transition('next', 'enemyTurn')
  ),
  healing: state(
    transition('next', 'enemyTurn')
  ),
  enemyTurn: state(
    transition('takeAttack', 'defeated', guard(function strongEnough (ctx) { return true })),
    transition('next', 'chooseMove')
  ),
  defeated: state()
});

export const reducers = createMachine({
  idle: state(
    transition('login', 'idle',
      reduce((ctx: any, ev: any) => ({ ...ctx, login: ev.target.value }))
    ),
    transition('password', 'idle',
      reduce((ctx: any, ev: any) => ({ ...ctx, password: ev.target.value }))
    ),
    transition('submit', 'complete')
  ),
  complete: state()
});


export const actions = createMachine({
  inactive: state(
    transition('toggle', 'active', action(function () {}))
  ),
  active: state(
    transition('toggle', 'inactive', action(function () {}))
  )
})

export const immediates = createMachine({
  idle: state(
    transition('submit', 'validate')
  ),
  validate: state(
    immediate('submission', guard(function canSubmit() {} as any)),
    immediate('idle')
  ),
  submission: state()
});

export const invokePromises = createMachine({
  idle: state(
    transition('load', 'loading')
  ),
  loading: invoke(async () => Promise.resolve(true),
    transition('done', 'idle',
      reduce((ctx: any, ev: any) => ({ ...ctx, user: ev.data }))
    ),
    transition('error', 'error',
      reduce((ctx: any, ev: any) => ({ ...ctx, error: ev.error }))
    ),
    transition('abort', 'idle')
  ),
  error: state()
})

export const invokeMachines = createMachine({
  greenLight: state(
    transition('button', 'yellowLight')
  ),
  yellowLight: invoke(
    createMachine({
      wait: invoke(async () => Promise.resolve(true),
        transition('done', 'check')
      ),
      check: state(
        immediate('complete', guard(function trafficIsClear() {} as any)),
        immediate('wait')
      ),
      complete: state() // final
    }),
    transition('done', 'redLight'),
    transition('cancel', 'greenLight')
  ),
  redLight: invoke(async () => Promise.resolve(true),
    transition('done', 'greenLight')
  )
})