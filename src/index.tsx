import React from "react"

interface MemoContext<S, A> {
	dispatch: React.Dispatch<A>
	subscribe: (cb: () => void) => () => void
	getState: () => any
}

interface SelectorFn<S, Selected> {
	(value: S): Selected
}

export interface Container<S, A> {
	Provider: React.FC<any>
	Context: React.Context<MemoContext<S, A>>
	useSelector: <Selected>(selector: SelectorFn<S, Selected>) => Selected
	useDispatch: () => React.Dispatch<A>
}

interface ContainerProps<S, A> {
	reducer: React.Reducer<S, A>
	init: S
	enhance?: Function
}

interface createContainerInterface {
	<S, A>(
		reducer: React.Reducer<S, A>,
		init: S,
		enhance?: Function | undefined,
	): Container<S, A>
}

function createContainer<S, A>(
	reducer: React.Reducer<S, A>,
	init: S,
	enhance?: Function,
): Container<S, A> {
	if (enhance) {
		return enhance(createContainer)(reducer, init)
	}

	const Context = React.createContext<MemoContext<S, A>>(
		{} as MemoContext<S, A>,
	)
	const Provider: React.FC<any> = ({
		children,
	}: {
		children: React.ReactNode
	}) => {
		const [store, dispatch] = React.useReducer(reducer, init)
		const storeRef = React.useRef(store)
		storeRef.current = store

		const subscribeRef = React.useRef<Array<Function>>([])

		React.useLayoutEffect(() => {
			subscribeRef.current.forEach((listener) => {
				listener()
			})
		}, [store])

		const value = React.useMemo(
			() => ({
				dispatch,
				subscribe: (cb: () => void) => {
					subscribeRef.current.push(cb)
					return function unsubscribe() {
						subscribeRef.current = subscribeRef.current.filter(
							(sub) => sub !== cb,
						)
					}
				},
				getState: () => storeRef.current,
			}),
			[],
		)
		return <Context.Provider value={value}>{children}</Context.Provider>
	}

	function useSelector<Selected>(selector: SelectorFn<S, Selected>) {
		const [, forceRender] = React.useReducer((s) => s + 1, 0)

		const store = React.useContext(Context) as MemoContext<S, A>

		const selectorRef = React.useRef(selector)

		const selectStateRef = React.useRef(selector(store.getState()))
		selectStateRef.current = selector(store.getState())

		const checkShouldUpdate = React.useCallback(() => {
			const newState = selectorRef.current(store.getState())

			if (newState !== selectStateRef.current) {
				forceRender()
			}
		}, [store])

		React.useEffect(() => {
			const unsubscribe = store.subscribe(checkShouldUpdate)
			return () => unsubscribe()
		}, [store, checkShouldUpdate])

		return selectStateRef.current
	}

	function useDispatch() {
		const store = React.useContext(Context) as MemoContext<S, A>
		return store.dispatch
	}

	return {
		Context,
		Provider,
		useSelector,
		useDispatch,
	}
}

function combineReducers<S extends Record<string, any>, A>(
	reducers: { [key in string]: React.Reducer<any, any> },
): React.Reducer<S, A> {
	return function (state, action) {
		let hasChange = false
		const newState = Object.create(null)
		Object.entries(reducers).forEach(([key, reducer]) => {
			const childrenState = state[key]
			newState[key] = reducer(childrenState, action)
			hasChange = hasChange || childrenState !== newState[key]
		})
		return hasChange ? newState : state
	}
}

function applyMiddleWare<S, A>(...middlewares: any[]) {
	return (createContainer: createContainerInterface) =>
		(reducer: React.Reducer<S, A>, init: S, enhance?: Function) => {
			const Store = createContainer(reducer, init)
			const useDispatch =  compose(...middlewares)(Store.useDispatch)

			return { ...Store, useDispatch }
		}
}

function compose(...funcs: Function[]) {
	return funcs.reduce(
		(a, b) =>
			(...args: any) =>
				a(b(...args)),
	)
}

export { createContainer, combineReducers, applyMiddleWare }
