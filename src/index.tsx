import React from "react"

interface MemoContext<S, A> {
	dispatch: React.Dispatch<A>
	subscribe: (cb: () => void) => () => void
	getState: () => any
}

interface SelectorFn<S, Selected> {
	(value: S): Selected
}

function createContainer<S, A>(reducer: React.Reducer<S, A>, init: S) {
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

	return {
		Context,
		Provider,
		useSelector,
	}
}

export { createContainer }
