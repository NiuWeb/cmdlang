export interface Argument {
    /**
     * Used for a quick example if the argument is named.
     * The same as `name` if the argument is positional.
     */
    label: string
    /**
     * The name of the argument.
     */
    name: string
    /**
     * Is the argument positional?
     */
    positional: boolean
    /**
     * Is the argument optional?
     */
    optional: boolean
    /**
     * Description provided in the documentation dictionary.
     */
    description?: string
}