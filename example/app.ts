import { robot3viz } from '../src'
import * as machines from '../test/machines/features'

function getSVG(name: string) {
  return document.getElementById(name)! as unknown as SVGElement
}

robot3viz(
  machines.transitions,
  getSVG('transitions')
)

robot3viz(
  machines.guards,
  getSVG('guards')
)

robot3viz(
  machines.reducers,
  getSVG('reducers')
)

robot3viz(
  machines.immediates,
  getSVG('immediates')
)
