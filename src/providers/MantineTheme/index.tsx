import React, { PropsWithChildren } from "react";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { theme } from "./theme";
import { Notifications } from "@mantine/notifications";
import { cssVariableResolver } from "./cssVariableResolver";

export function MantineThemeProvider(props: PropsWithChildren<unknown>) {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
      //
      cssVariablesResolver={cssVariableResolver}
    >
      <Notifications />
      {props.children}
    </MantineProvider>
  );
}
