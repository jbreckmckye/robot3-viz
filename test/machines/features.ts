import { createMachine, immediate, invoke, guard, reduce, state, transition, action } from 'robot3';

/**
 * Machine with a graph of transitions
 *
 * inactive --(toggle)--> active
 * active   --(toggle)--> inactive
 */
export const transitions = createMachine({
  inactive: state(
    transition('toggle', 'active')
  ),
  active: state(
    transition('toggle', 'inactive')
  )
});

/**
 * Machine with a final state
 *
 * pending --(done)--> finished
 * finished  [final=true]
 */
export const finalState = createMachine({
  pending: state(
    transition('done', 'finished')
  ),
  finished: state()
});

/**
 * Machine with guards
 *
 * chooseMove --(next)--|guard|--> healing
 *            --(next)--> attacking
 *
 * attacking  --(next)--> enemyTurn
 * healing    --(next)--> enemyTurn
 *
 * enemyTurn  --(takeAttack)--|guard|--> defeated
 *            --(next)--> chooseMove
 *
 * defeated [final=true]
 */
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

/**
 * Machine with reducers
 *
 * idle  --(login)--> idle [reduce]
 *       --(password)--> idle [reduce]
 *       --(submit) --> complete
 *
 * complete [final=true]
 */
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

/**
 * Machine with immediates
 *
 * idle --(submit)-->validate
 *
 * validate >>--|guard|-->> submission
 *          >>-->> idle
 *
 * submission [final]
 */
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

/**
 * Machine with actions
 *
 * off --> on { On! }
 * on --> off { Off! }
 */
export const actioned = createMachine({
  off: state(
    transition('switch', 'on',
      action(() => console.log('On!'))
    )
  ),
  on: state(
    transition('switch', 'off',
      action(() => console.log('Off!'))
    )
  )
})

/**
 * Machine that invokes promises
 *
 * idle --(load)--> loading
 *
 * loading --> {loadingPromise} --(done)--> idle [reduce]
 *                              --(error)--> error [reduce]
 *         --(abort)--> idle
 *
 * error [final]
 */
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

/**
 * Machine that invokes other machines
 *
 * # Graph 1
 *
 * greenLight --(button)--> yellowLight
 *
 * yellowLight --{graph2} --(done)--> redLight
 *             --(cancel)--> greenLight
 *
 * redLight --{redLightPromise} --(done)--> greenLight
 *
 * # Graph 2
 * (etc)
 */
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