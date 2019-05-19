
import { IContext, ThemeStyle } from "msteams-ui-components-react";
import { style } from "typestyle";

function colors(context: IContext) {
  switch (context.style) {
    case ThemeStyle.Dark:
      return {
        focusOutline: context.colors.dark.white,
        focusBackground: context.colors.transparent,
        focusText: "inherit"
      };
    case ThemeStyle.HighContrast:
      return {
        focusOutline: context.colors.transparent,
        focusBackground: context.colors.highContrast.yellow,
        focusText: context.colors.highContrast.black
      };
    case ThemeStyle.Light:
    default:
      return {
        focusOutline: context.colors.light.black,
        focusBackground: context.colors.transparent,
        focusText: "inherit"
      };
  }
}

export function appCard(context: IContext) {
  const { rem, font, spacing } = context;
  const { sizes, weights } = font;
  const themedColors = colors(context);

  return {
    panel: style({
      marginRight: rem(1.2),
      marginBottom: rem(1.2),
      flex: `0 0 ${rem(27)}`,
      overflow: "visible",
      boxSizing: "content-box",
    }),
    card: style({
      padding: spacing.base,
      border: "1px solid silver",
      borderRadius: rem(0.3),
      font: "inherit",
      color: "inherit",
      background: "transparent",
      cursor: "pointer",
      flex: 1,
      margin: "1em",
      $nest: {
        "&:focus": {
          color: themedColors.focusText,
          background: themedColors.focusBackground,
          outline: `${rem(0.2)} solid ${themedColors.focusOutline}`,
          outlineOffset: `-${rem(0.2)}`
        }
      }
    }),
    header: {
      container: style({
        display: "flex",
        maxWidth: "100%"
      }),
      icon: style({
        height: rem(4.8),
        display: "inline-block",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: rem(0.3),
        flex: `0 0 ${rem(4.8)}`
      }),
      text: {
        container: style({
          textAlign: "left",
          marginTop: rem(0.5),
          whiteSpace: "nowrap",
          paddingLeft: rem(1.2),
          flex: "1 1 auto",
          overflow: "hidden"
        }),
        primary: style(sizes.base, weights.semibold, {
          overflow: "hidden",
          textOverflow: "ellipsis"
        }),
        secondary: style(sizes.caption, weights.regular, {
          overflow: "hidden",
          textOverflow: "ellipsis"
        })
      },
      ellipsis: style({
        position: "absolute",
        right: rem(-1.3),
        top: rem(-1.6)
      })
    },
    body: style(sizes.caption, {
      textAlign: "left",
      overflow: "hidden",
      textOverflow: "ellipsis",
      marginTop: rem(1.6),
      marginBottom: "0",
      height: rem(4.5)
    })
  };
}
