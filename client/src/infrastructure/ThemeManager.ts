import { Palette } from "@mui/material";
import baseStyled, { ThemedStyledInterface } from "styled-components";

import bottomWaves from "../assets/bottom-waves.svg";
import bottomWavesFlipped from "../assets/bottom-waves-v-flipped.svg";

import bottomWavesSecondary from "../assets/bottom-waves-secondary.svg";
import bottomWavesFlippedSecondary from "../assets/bottom-waves-v-flipped-secondary.svg";

import bgSteps from "../assets/bg-steps.svg";
import bgStepsSecondary from "../assets/bg-steps-secondary.svg";

import { purple } from "@mui/material/colors";
import { Typography } from "@mui/material/styles/createTypography";

export interface StyledTheme {
  svgs: {
    bottomWaves: string;
    bottomWavesFlipped: string;
    bgSteps: string;
  };
  colors: {
    text: string;
    accentText: string;
    background: string;
    topbarBg: string;
    scrollBar: string;
  };
}

export const styled = baseStyled as ThemedStyledInterface<StyledTheme>;

export const styledLightTheme: StyledTheme = {
  svgs: {
    bottomWaves: bottomWaves,
    bottomWavesFlipped: bottomWavesFlipped,
    bgSteps: bgSteps,
  },
  colors: {
    accentText: "#4facf7",
    text: "#333",
    background: "white",
    topbarBg: "#0066ff",
    scrollBar: "rgb(0 102 255 / 50%)",
  },
};

export const styledDarkTheme: StyledTheme = {
  svgs: {
    bottomWaves: bottomWavesSecondary,
    bottomWavesFlipped: bottomWavesFlippedSecondary,
    bgSteps: bgStepsSecondary,
  },
  colors: {
    accentText: "#ba68c8",
    text: "white",
    background: "#333",
    topbarBg: "#7b1fa2",
    scrollBar: "rgb(186 104 200 / 50%)",
  },
};

export const muiLightTheme = {
  typography: {
    button: {
      textTransform: "capitalize",
    },
  } as Typography,
};

export const muiDarkTheme = {
  palette: {
    mode: "dark",
    primary: {
      main: purple[500],
    },
  } as Palette,
  typography: {
    button: {
      textTransform: "capitalize",
    },
  } as Typography,
};
