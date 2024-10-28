import { createGlobalState } from 'react-hooks-global-state'

const { setGlobalState, useGlobalState, getGlobalState } = createGlobalState({
  contract: null,
  connectedAccount: null
})

export {
    useGlobalState,
    setGlobalState,
    getGlobalState
}