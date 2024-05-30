import type { MantineTheme } from "metabase/ui";
import { convertFontSizeToPx } from "metabase/visualizations/shared/utils/font-size-to-px";
import type { VisualizationStyle } from "metabase/visualizations/types";

/**
 * Computes the visualization style from the Mantine theme.
 */
export function getVisualizationStyleFromTheme(
  theme: MantineTheme,
): VisualizationStyle {
  const chartTheme = theme.other.cartesian;
  const labelTheme = chartTheme?.label;

  const style: VisualizationStyle = { label: {} };

  // Overrides the font size of the series labels
  if (labelTheme?.fontSize) {
    const rootFontSize = convertFontSizeToPx(theme.other.fontSize);
    const labelFontSize = convertFontSizeToPx(
      labelTheme.fontSize,
      rootFontSize,
    );

    if (labelFontSize && style.label) {
      style.label.fontSize = labelFontSize;
    }
  }

  return style;
}