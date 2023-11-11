import { Parser } from "./Parser"

test("find tokens", () => {
    const finder = new Parser(`
        const $awa 10{x}{y}{z}
        run another thing
        set value is {
            1 - $awa*2
        }
        another thing {
            5 + $awa^2,
            1 - $awa*2
        }
        const $uwu {
            $awa + 0.5
        }
    `)

    console.log(finder.findTokens())
})