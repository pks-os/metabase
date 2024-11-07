import {
  MetabaseProvider,
  StaticDashboard,
} from "@metabase/embedding-sdk-react"; // eslint-disable-line import/no-unresolved

import { ORDERS_DASHBOARD_ID } from "e2e/support/cypress_sample_instance_data";
import { restore, setTokenFeatures } from "e2e/support/helpers";
import {
  JWT_PROVIDER_URL,
  METABASE_INSTANCE_URL,
} from "e2e/support/helpers/e2e-embedding-sdk-helpers";
import { setupJwt } from "e2e/support/helpers/e2e-jwt-helpers";

describe("scenarios > embedding-sdk > locale set on MetabaseProvider", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();
    setTokenFeatures("all");
    setupJwt();
    cy.signOut();
  });

  it("when locale=de it should display german text", () => {
    cy.mount(
      <MetabaseProvider
        config={{
          jwtProviderUri: JWT_PROVIDER_URL,
          metabaseInstanceUrl: METABASE_INSTANCE_URL,
        }}
      >
        <StaticDashboard dashboardId={ORDERS_DASHBOARD_ID} withDownloads />
      </MetabaseProvider>,
    );

    cy.get("#metabase-sdk-root")
      .findByText("Als PDF exportieren")
      .should("exist");
  });
});
