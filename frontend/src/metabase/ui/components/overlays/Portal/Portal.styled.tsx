import type { MantineThemeOverride } from "@mantine/core";

import ZIndex from "metabase/css/core/z-index.module.css";

export const getPortalOverrides = (): MantineThemeOverride["components"] => ({
  Portal: {
    defaultProps: {
      zIndex: "var(--mb-floating-element-z-index)",
    },
    // FIXME: This class might not be doing anything
    classNames: { dropdown: ZIndex.FloatingElement },
  },
});
