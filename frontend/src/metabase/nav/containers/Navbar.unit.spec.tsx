/* eslint-disable jest/expect-expect */
import { Route } from "react-router";
import fetchMock from "fetch-mock";
import type { Store } from "@reduxjs/toolkit";
import {
  CLOSE_NAVBAR,
  OPEN_NAVBAR,
  isNavbarOpenForPathname,
} from "metabase/redux/app";
import * as dom from "metabase/lib/dom";

import type { State } from "metabase-types/store";

import {
  renderWithProviders,
  screen,
  waitForLoaderToBeRemoved,
} from "__support__/ui";
import {
  setupCollectionsEndpoints,
  setupDatabasesEndpoints,
} from "__support__/server-mocks";

import type { User } from "metabase-types/api";
import { createMockDatabase, createMockUser } from "metabase-types/api/mocks";
import {
  createMockAppState,
  createMockEmbedState,
  createMockState,
} from "metabase-types/store/mocks";

import Navbar from "./Navbar";

type SetupOpts = {
  isOpen?: boolean;
  route?: string;
  pathname?: string;
  user?: User | null;
  embedOptions?: Record<string, string | boolean>;
};

async function setup({
  isOpen,
  pathname = "/",
  route = pathname,
  user = createMockUser(),
  embedOptions = {},
}: SetupOpts = {}) {
  setupCollectionsEndpoints({ collections: [] });
  setupDatabasesEndpoints([createMockDatabase()]);
  fetchMock.get("path:/api/bookmark", []);

  const storeInitialState = createMockState({
    app: createMockAppState({
      isNavbarOpen: isOpen ?? isNavbarOpenForPathname(pathname, true),
    }),
    embed: createMockEmbedState(embedOptions),
    currentUser: user,
  });

  const { store } = renderWithProviders(
    <Route path={route} component={Navbar} />,
    {
      storeInitialState,
      initialRoute: pathname,
      withRouter: true,
      withDND: true,
    },
  );

  // manually dispatch the location event that would otherwise be done for us with react-router-redux
  dispatchLocationChange({ store, initialRoute: true, pathname });

  await waitForLoaderToBeRemoved();

  return store;
}

describe("nav > containers > Navbar > Core App", () => {
  it("should be open when isOpen is true", async () => {
    await setup({ isOpen: true });
    expectNavbarOpen();
  });

  it("should be hidden when isOpen is false", async () => {
    await setup({ isOpen: false });
    expectNavbarClosed();
  });

  it("should not render when signed out", async () => {
    await setup({ user: null });
    expect(screen.queryByTestId("main-navbar-root")).not.toBeInTheDocument();
  });

  it("should not render when in the admin app", async () => {
    await setup({ pathname: "/admin/" });
    expect(screen.queryByTestId("main-navbar-root")).not.toBeInTheDocument();
  });

  ["question", "model", "dashboard"].forEach(pathname => {
    it(`should be hidden on initial load for a ${pathname}`, async () => {
      await setup({ pathname: `/${pathname}/1` });
      expectNavbarClosed();
    });
  });

  it("should hide when visiting a question", async () => {
    const store = await setup({ pathname: "/" });
    expectNavbarOpen();
    dispatchLocationChange({ store, pathname: "/question/1" });
    expectNavbarClosed();
  });

  it("should hide when visiting a question and stay hidden when returning to collection", async () => {
    const store = await setup({ pathname: "/collection/1" });
    expectNavbarOpen();
    dispatchLocationChange({ store, pathname: "/question/1" });
    expectNavbarClosed();
    dispatchLocationChange({ store, pathname: "/collection/1" });
    expectNavbarClosed();
  });

  it("should preserve state when navigating collections", async () => {
    const store = await setup({ pathname: "/collection/1" });
    expectNavbarOpen();
    dispatchLocationChange({ store, pathname: "/collection/2" });
    expectNavbarOpen();
    dispatchLocationChange({ store, pathname: "/question/1" });
    expectNavbarClosed();
    dispatchLocationChange({ store, pathname: "/collection/3" });
    expectNavbarClosed();
    dispatchLocationChange({ store, pathname: "/collection/4" });
    expectNavbarClosed();
    store.dispatch({ type: OPEN_NAVBAR });
    expectNavbarOpen();
    dispatchLocationChange({ store, pathname: "/collection/5" });
    expectNavbarOpen();
    store.dispatch({ type: CLOSE_NAVBAR });
    dispatchLocationChange({ store, pathname: "/collection/6" });
    expectNavbarClosed();
  });

  describe("embedded", () => {
    let isWithinIframeSpy: jest.SpyInstance;

    beforeAll(() => {
      isWithinIframeSpy = jest.spyOn(dom, "isWithinIframe");
      isWithinIframeSpy.mockReturnValue(true);
    });

    afterAll(() => {
      isWithinIframeSpy.mockRestore();
    });

    const normallyHiddenRoutes = ["/model/1", "/dashboard/1", "/question/1"];
    const normallyVisibleRoutes = ["/"];
    const allRoutes = [...normallyHiddenRoutes, ...normallyVisibleRoutes];

    allRoutes.forEach(route => {
      it(`should be visible when embedded and on ${route} top_nav=false&side_nav=true`, async () => {
        await setup({
          pathname: route,
          isOpen: false, // this should be ignored and overridden by the embedding params
          embedOptions: { top_nav: false, side_nav: true },
        });
        expectNavbarOpen();
      });
    });

    normallyVisibleRoutes.forEach(route => {
      it(`should be visible when embedded and on ${route} top_nav=true&side_nav=true`, async () => {
        await setup({
          pathname: route,
          isOpen: true,
          embedOptions: { top_nav: true, side_nav: true },
        });
        expectNavbarOpen();
      });
    });

    normallyHiddenRoutes.forEach(route => {
      it(`should not be visible when embedded and on ${route} top_nav=true&side_nav=true`, async () => {
        await setup({
          pathname: route,
          isOpen: false,
          embedOptions: { top_nav: true, side_nav: true },
        });
        expectNavbarClosed();
      });
    });

    normallyHiddenRoutes.forEach(route => {
      it(`should not be visible when embedded and on ${route} top_nav=true&side_nav=true`, async () => {
        await setup({
          pathname: route,
          isOpen: false,
          embedOptions: { top_nav: true, side_nav: true },
        });
        expectNavbarClosed();
      });
    });

    // the current state of App.tsx is such that this should never even happen because we don't even render the parent component
    // but this test will cover any future changes in the component tree
    allRoutes.forEach(route => {
      it(`should not be visible when embedded and on ${route} with side_nav=false`, async () => {
        await setup({
          pathname: route,
          isOpen: false,
          embedOptions: { side_nav: false },
        });
        expectNavbarClosed();
      });
    });
  });
});

function expectNavbarOpen() {
  const navbar = screen.getByTestId("main-navbar-root");
  expect(navbar).toBeVisible();
  expect(navbar).toHaveAttribute("aria-hidden", "false");
}

function expectNavbarClosed() {
  const navbar = screen.getByTestId("main-navbar-root");
  expect(navbar).not.toBeVisible();
  expect(navbar).toHaveAttribute("aria-hidden", "true");
}

interface DispatchLocationChangeParams {
  store: Store<State>;
  initialRoute?: boolean;
  pathname: string;
}

function dispatchLocationChange({
  store,
  initialRoute = false,
  pathname,
}: DispatchLocationChangeParams) {
  store.dispatch({
    type: "@@router/LOCATION_CHANGE",
    payload: {
      pathname,
      action: initialRoute ? "POP" : "PUSH",
    },
  });
}
