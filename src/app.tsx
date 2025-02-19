import { createRoot } from "react-dom/client";
import { IndexRoute } from "./routes/Index";
import { MantineThemeProvider } from "./providers/MantineTheme";

const root = createRoot(document.body);
root.render(
  <MantineThemeProvider>
    <IndexRoute />
  </MantineThemeProvider>
);
