# cmdlang

A command-line language.

## 1. Installation
```
npm i @bygdle/cmdlang
```

## 2. Usage
The package exposes four main classes: the program and compiler, and a parser for the language instructions and expressions.

The most basic usage requires a program and a compiler, as follows:

```ts
/// CREATING THE PROGRAM

// a basic program for creating squares and
// calculating their perimeter

// First, an array will store the created squares,
// this will be the program "context"
const squares: { w: number, h: number }[] = []

// Then, the program is created by passing the context,
// and the commands tree.
const program = new Program(squares, {
  "square": {
    name: "square",
    children: {
      "add": {
        name: "add",
        arguments: "[width=] [height=]",
        compile({ named }, { context }) {
          // this function will be executed only
          // when the code string is initially parsed.
          // as a result, the function will return
          // another function, which will be executed
          // every time the compiled code is called.

          // so this is executed once
          const { width, height } = named
          const w = Number(width).valueOf()
          const h = Number(height).valueOf()

          return () => {
            // and this is executed every time
            // the compiled code is called
            context.push({ w, h })
          }
        }
      },
      "perimeter": {
        name: "perimeter",
        arguments: "index",
        compile({ values }, { context }) {
          const index = Number(values[0]).valueOf()

          return () => {
            const square = context[index]
            return square.w * 2 + square.h * 2
          }
        }
      }
    }
  }
})
```

Now, the compiler:
```ts
/// THE COMPILER CODE

// Creating a compiler requires a program.
// A language parser and expression parser are
// created by default.
const compiler = new Compiler(program)

// the main function compiles a string into
// a callable function.
const cmd = compiler.compileString(`
  const $pi {22/7}

  square add width=5 height=7 // instruction 1
  square add width={ // instruction 2
      2+2
  } height={
      1 + $pi^2
  }

  square perimeter 0 # instruction 3
  square perimeter { 5/5 } /* instruction 4 */
`)

// if we call the compiled function, it will
// return the result of all the instructions in the code
const result = cmd()
```

### [3. Language overview](./overview.md)