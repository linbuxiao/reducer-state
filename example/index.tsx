import React from "react"
import ReactDOM from "react-dom"
import { createContainer } from "../src/index"

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

const Store = createContainer(reducer, init)

const useOnClick = () => {
  const { dispatch } = React.useContext(Store.Context);
  return () => dispatch({ type: "ON_CLICK" });
};

const Click = () => {
  const decrement = useOnClick()
  const click = Store.useSelector(state => state.click)
  console.log("click render");
  
	return <>
    <button onClick={decrement}>click</button>
    <div>Click:{click}</div>
  </>
}

const useTime = () => {
  const { dispatch } = React.useContext(Store.Context)
  React.useEffect(()=> {
    const interval = setInterval(()=> dispatch({ type: "ON_TIME" }), 1000)
    return () => clearInterval(interval)
  }, [dispatch])
}

const Time = () => {
  useTime()
  const time = Store.useSelector(state => state.time)
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