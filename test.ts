const func1 = function(e: number) {
  console.log("第一个函数", e)

  return 1 + e
}

const func2 = function(e: number) {
  console.log("第二个函数", e)

  return 2 + e
}

const func3 = function(e: number) {
  console.log("第三个函数", e)

  return 3 + e
}

const compose = function(...func: Function[]) {
  return func.reduce((a,b)=> {
    console.log(a);
    
    return (...args:any) => {

      return a(b(...args))
    }
  })
}

compose(func1, func2, func3)(3)