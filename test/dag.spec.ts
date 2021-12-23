import { inspect } from 'util'

import { createDag } from '../src/createDag'

import {
  actioned,
  guards,
  immediates,
  invokeMachines,
  invokePromises,
  reducers,
  transitions
} from './machines/features'
import { R3Machine } from '../src/types/robot3';

describe('DAG', () => {
  test('output', () => {
    const result = createDag(invokeMachines as unknown as R3Machine)
    console.warn(inspect(result, { depth: 8 }))
  })
})