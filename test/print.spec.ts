import { inspect } from 'util'

import {
  actioned,
  guards,
  immediates,
  invokeMachines,
  invokePromises,
  reducers,
  transitions
} from './machines/features';

describe("Print the contents of various Robot3 machines to the console", () => {
  // test("Machine: transitions", () => {
  //   console.warn(inspect(transitions, { depth: 8 }))
  //   expect(1).toBe(1)
  // })

  // test("Machine: reducers", () => {
  //   console.warn(inspect(reducers, { depth: 8 }))
  //   expect(1).toBe(1)
  // })

  // test("Machine: immediates", () => {
  //   console.warn(inspect(immediates, { depth: 8 }))
  //   expect(1).toBe(1)
  // })

  // test("Machine: guards", () => {
  //   console.warn(inspect(guards, { depth: 8 }))
  //   expect(1).toBe(1)
  // })

  // test("Machine: actioned", () => {
  //   console.warn(inspect(actioned, { depth: 8 }))
  //   expect(1).toBe(1)
  // })

  // test("Machine: promises", () => {
  //   console.warn(inspect(invokePromises, { depth: 8 }))
  //   expect(1).toBe(1)
  // })

  // test("Machine: sub-machines", () => {
  //   console.warn(inspect(invokeMachines, { depth: 8 }))
  //   expect(1).toBe(1)
  // })
})
