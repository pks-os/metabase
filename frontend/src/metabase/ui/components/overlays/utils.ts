import type { ModalBaseProps } from "@mantine/core";

/** To avoid z-index complications, change the props so that no portal exists
 * when the popover is closed */
export const preventEagerPortal = <
  T extends Partial<Pick<ModalBaseProps, "withinPortal" | "opened">>,
>(
  props: T,
): T => {
  const { withinPortal, opened } = props;
  return { ...props, withinPortal: withinPortal && opened };
};
