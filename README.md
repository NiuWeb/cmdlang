# cmdlang

A basic command-line language.


## 1. Basic usage

### 1.1. General concepts

**Command:** A function to be called with a given set of arguments. 

**Instruction:** A single line that runs an specific function. An instruction normally is delimited by a line break, but a several lines can be used as a single instruction if they are separated by a backslash (`\`) at the end of each line (except for the last one), as follows:

```
instruction1 \
still in the instruction1 \
still in the instruction1
instruction2
```

An instruction is split into parts by spaces, and each part will identify a command or an argument.

**Notes:**

- The entire language is case-insensitive. Actually, a code string will be converted to lower case before being parsed.

### 1.2. Tree structure

Commands have a tree structure. Each command can have subcommands, as follows:
```
command subcommand1 subcommand2 ... subcommandN
```

When a subcommand without any other subcommands is reached, the following parts of the instruction are passed to the command as arguments. For example, in the line:

```
command subcommand1 subcommand2 arg1 arg2 arg3
```

Assuming that `subcommand2` does not have any subcommands, the command `command subcommand1 subcommand2` will be called with the arguments `arg1 arg2 arg3`.

An argument can be a key-value pair, as follows:

```
command arg1=value1 arg2=value2
```


### 1.3. Comments

You can add comments to the code by using the `#` or `\\` character. Everything after the `#` or `\\` character will be ignored by the parser. For example:

```
command arg1=value1 # This is a comment
command arg1=value1 \\ This is another comment
```

There are also multi-line comments, which are delimited by `/*` and `*/`. For example:

```
command arg1=value1 /* This is a multi-line comment
This is still a multi-line comment
This is still a multi-line comment */ 
command arg1=value1
```

### 1.4. Constants
A constant can be defined by using the `const` keyword, as follows:

```
const $my_constant 1
```

And then used in any part of the code as follows:

```
command arg1=$my_constant
```

**NOTE:** that the constants are preprocessed, which means they are parsed before the actual instructions, so they can be used in any part of the code, including in the definition of other instructions, like:

```
const $my_cmd subcommand1 arg1=$my_constant
command $my_cmd
```


## 2. Embed expressions
By default, the command-line language does not accept any math or logical expressions. However, it is possible to embed expressions in an instruction by using braces (`{}`), as follows:

```
command arg1={1+2} arg2={1 + sqrt(5)}
```

The embed expressions are evaluated by a different parser, which allows mathematical and function expressions. You can separate multiple expressions in a single block by using commas, but only the last expression will be returned to the command instruction. For example:

```
command arg1={1+2, 3+4, 5+6}
```

The above instruction will be replaced as `command arg1=11`.

**NOTE:** Embed expressions are also preprocessed, in the same order as constants, and before the actual instructions.

```
const $A 150
const $B { 10*$A }

command arg1=$B
```