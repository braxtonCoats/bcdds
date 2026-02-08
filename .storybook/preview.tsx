import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import "../src/index.css";
import "../src/theme.css";
import "./dark-theme.css";
import theme from "./theme";

const preview: Preview = {
  parameters: {
    docs: {
      theme: theme,
      source: {
        type: "dynamic",
      },
      canvas: {
        sourceState: "shown",
      },
    },
  },

  decorators: [
    withThemeByDataAttribute({
      themes: {
        Light: "light",
        Dark: "dark",
      },
      defaultTheme: "Light",
      attributeName: "data-theme",
    }),
  ],

  tags: ["autodocs"],
};

export default preview;
