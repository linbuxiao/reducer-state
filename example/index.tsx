import React from "react"
import ReactDOM from "react-dom"
import { createContainer, combineReducers, applyMiddleWare } from "../src/index"
import autoLogger from "./enhancer"

const init = { click: 0, time: 0 }

const reducer = (state: typeof init, action: any) => {
  switch(action.type) {
    case "ON_CLICK": {
      return {
        ...state,
        click: state.click + 1
      }
    }
    case "ON_TIME": {
      return {
        ...state,
        time: state.time + 1
      }
    }
  }
}

const reducerTest = (state: typeof init, action: any) => {
  switch(action.type) {
    case "ON_CLICK": {
      return {
        ...state,
        click: state.click + 1
      }
    }
    case "ON_TIME": {
      return {
        ...state,
        time: state.time + 1
      }
    }
  }
}

const applyMiddleWare1 = (useDispatch) => {
  const _useDispatch = () => {
    const dispatch = useDispatch()
    const _dispatch = (action) => {
      console.log("第一层中间件");
      
      return dispatch(action)
    }

    return _dispatch
  }

  return _useDispatch
}

const applyMiddleWare2 = (useDispatch) => {
  
  const _useDispatch = () => {
    const dispatch = useDispatch()
    const _dispatch = (action) => {
      console.log("第二层中间件");
      
      return dispatch(action)
    }

    return _dispatch
  }

  return _useDispatch
}


const Store = createContainer(combineReducers({reducer, reducerTest}), { reducer: init, reducerTest: init }, applyMiddleWare(applyMiddleWare1, applyMiddleWare2))



const Click = () => {
  const dispatch  = Store.useDispatch()
  const decrement = () => dispatch({ type: "ON_CLICK" })
  const click = Store.useSelector(state => state.reducer.click)
  console.log("click render");
  
	return <>
    <button onClick={decrement}>click</button>
    <div>Click:{click}</div>
  </>
}

const Time = () => {
  const dispatch  = Store.useDispatch()
  React.useEffect(()=> {
    const interval = setInterval(()=> dispatch({ type: "ON_TIME" }), 1000)
    return () => clearInterval(interval)
  }, [dispatch])
  const time = Store.useSelector(state => state.reducerTest.time)
  console.log("time render");
  return <div>Time: {time}</div>
}
 
function App() {
	return (
		<Store.Provider>
      <Click />
      <Time />
    </Store.Provider>
	)
}

ReactDOM.render(<App />, document.getElementById("root"))