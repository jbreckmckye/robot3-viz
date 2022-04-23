import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import * as machines from '../machines/features'
import { Robot3Viz } from '../../src/react/Robot3Viz'

function App() {
  return (
    <>
      <h1>Robot3Viz examples</h1>

      <h2>Toggle switch</h2>
      <Robot3Viz fsm={machines.transitions} />

      <h2>RPG enemy (with guard functions)</h2>
      <Robot3Viz fsm={machines.guards} />

      <h2>Login screen (using reducers)</h2>
      <Robot3Viz fsm={machines.reducers} />

      <h2>Form submission (with immediates)</h2>
      <Robot3Viz fsm={machines.immediates} />

      <h2>Loading data (with promises)</h2>
      <Robot3Viz fsm={machines.invokePromises} />

      <h2>Example to support re-rendering</h2>
      <DynamicRender />
    </>
  )
}

function DynamicRender() {
  const [ whichFSM, toggleFSM ] = useState(true)
  const dynamicFSM = whichFSM ? machines.transitions : machines.guards

  return (
    <>
      <button onClick={() => toggleFSM(!whichFSM)}>
        SWITCH FSM
      </button>
      <Robot3Viz fsm={dynamicFSM} />
    </>
  )
}

ReactDOM.render(
  <App/>,
  document.getElementById('app')
)