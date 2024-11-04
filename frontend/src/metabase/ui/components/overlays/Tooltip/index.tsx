import { Tooltip as MantineTooltip, type TooltipProps } from "@mantine/core";

import { preventEagerPortal } from "../utils";
export type { TooltipProps } from "@mantine/core";
export { getTooltipOverrides } from "./Tooltip.styled";

export const Tooltip = (props: TooltipProps) => (
  <MantineTooltip {...preventEagerPortal(props)} />
);