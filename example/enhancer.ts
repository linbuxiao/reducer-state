export default function autoLogger() {
  return createStore => (reducer, initialState, enhancer) => {
    const Store = createStore(reducer, initialState, enhancer)
    // 包裹进hook
    const useDispatch = () => {
      const dispatch = Store.useDispatch()
      // 重写dispatch
      const _dispatch = (action) => {
        console.log("From enhancer", action.type);
        dispatch(action)
      }
      return _dispatch
    }
    
    return {...Store, useDispatch}
  }
}
