import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";

import { useTempStorage } from "metabase/common/hooks";

import { TrialBanner } from "./TrialBanner";

jest.mock("metabase/common/hooks", () => ({
  useTempStorage: jest.fn(),
}));

describe("TrialBanner", () => {
  it("should call handleBannerClose and set the current timestamp on close icon click", async () => {
    const setLastDismissed = jest.fn();
    (useTempStorage as jest.Mock).mockReturnValue([null, setLastDismissed]);

    const tokenStatus = {
      valid: true,
      "valid-thru": dayjs().add(5, "day").add(1, "minute").toISOString(),
      trial: true,
    };

    render(<TrialBanner tokenStatus={tokenStatus} />);

    expect(screen.getByText("5 days left in your trial.")).toBeInTheDocument();

    const closeButton = screen.getByLabelText("close icon");
    await userEvent.click(closeButton);

    expect(setLastDismissed).toHaveBeenCalledWith(dayjs().unix());
  });
});
