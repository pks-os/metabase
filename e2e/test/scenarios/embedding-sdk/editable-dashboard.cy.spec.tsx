import {
  EditableDashboard,
  MetabaseProvider,
} from "@metabase/embedding-sdk-react"; // eslint-disable-line import/no-unresolved

import { restore, setTokenFeatures } from "e2e/support/helpers";
import {
  JWT_PROVIDER_URL,
  METABASE_INSTANCE_URL,
} from "e2e/support/helpers/e2e-embedding-sdk-helpers";
import { setupJwt } from "e2e/support/helpers/e2e-jwt-helpers";

describe.skip("scenarios > embedding-sdk > editable-dashboard", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();
    setTokenFeatures("all");
    setupJwt();
    cy.request("PUT", "/api/setting", {
      "enable-embedding-sdk": true,
    });

    cy.createDashboard(
      {
        name: "Embedding SDK Test Dashboard",
      },
      { wrapId: true },
    );

    cy.signOut();

    cy.intercept("GET", "/api/dashboard/*").as("getDashboard");
    cy.intercept("GET", "/api/user/current").as("getUser");
    cy.intercept("POST", "/api/dashboard/*/dashcard/*/card/*/query").as(
      "dashcardQuery",
    );
  });

  it("Should not open sidesheet when clicking last edit info (metabase#48354)", () => {
    cy.get("@dashboardId").then(dashboardId => {
      cy.mount(
        <MetabaseProvider
          config={{
            jwtProviderUri: JWT_PROVIDER_URL,
            metabaseInstanceUrl: METABASE_INSTANCE_URL,
          }}
        >
          <EditableDashboard dashboardId={dashboardId} />
        </MetabaseProvider>,
      );
    });

    cy.get("#metabase-sdk-root")
      .findByText("Edited a few seconds ago by Bobby Tables")
      .click()
      .should("be.visible");
    cy.findByRole("heading", { name: "Info" }).should("not.exist");
    cy.findByRole("tab", { name: "Overview" }).should("not.exist");
    cy.findByRole("tab", { name: "History" }).should("not.exist");
  });
});
