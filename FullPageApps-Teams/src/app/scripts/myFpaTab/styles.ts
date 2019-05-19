
import { IContext, ThemeStyle } from "msteams-ui-components-react";
import { style } from "typestyle";


export function mainStyles(context: IContext) {
    const { rem, font } = context;
    const { weights } = font;
    return {
        heading: style(weights.semibold, {
            height: "3%"
        }),
        grid: style({
            display: "flex",
            flex: 1,
            flexWrap: "wrap",
            flexFlow: "row wrap",
            flexDirection: "row",
            overflow: "auto"
        }),
    };
}
