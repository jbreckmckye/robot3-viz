import React from 'react'
import ReactDOM from 'react-dom'

import * as machines from '../machines/features'
import { Robot3Viz } from '../../src/react/Robot3Viz'

function App() {
  return (
    <>
      <h1>Robot3Viz examples</h1>

      <h2>Transitions</h2>
      <Robot3Viz fsm={machines.transitions} />

      <h2>Guards</h2>
      <Robot3Viz fsm={machines.guards} />

      <h2>Reducers</h2>
      <Robot3Viz fsm={machines.reducers} />

      <h2>Immediates</h2>
      <Robot3Viz fsm={machines.immediates} />
    </>
  )
}

ReactDOM.render(
  <App/>,
  document.getElementById('app')
)