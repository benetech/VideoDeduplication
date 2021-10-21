import selector from "../support/selector";
import ignoreUncaughtError, {
  withMessage,
} from "../support/ignoreUncaughtError";

describe("Application Sidebar Menu", () => {
  // Menu elements selectors
  const menu = selector("AppMenu");
  const toggle = selector("AppMenuToggle");
  const item = (text: string): string =>
    `${selector("AppMenuItem")}:contains("${text}")`;

  beforeEach(() => {
    // It is healthy to ignore this error
    // See https://stackoverflow.com/a/50387233 for more details.
    ignoreUncaughtError(withMessage("ResizeObserver loop limit exceeded"));
    // TODO: investigate and fix the following error (#442)
    ignoreUncaughtError(
      withMessage(
        "ResizeObserver loop completed with undelivered notifications."
      )
    );
    cy.visit("/");
  });

  it("should expand/collapse on demand", () => {
    // Expanded by default
    cy.get(menu).should("be.visible");
    cy.get(menu).invoke("width").should("be.gt", 200);

    // Collapse
    cy.get(toggle).click();
    cy.get(menu).should("be.visible");
    cy.get(menu).invoke("width").should("be.lt", 100);

    // Expand
    cy.get(toggle).click();
    cy.get(menu).should("be.visible");
    cy.get(menu).invoke("width").should("be.gt", 200);
  });

  it("navigates to correct pages", () => {
    cy.get(item("My Collection")).click();
    cy.url().should("contain", "/collection");
    cy.get(item("Dashboard")).click();
    cy.url().should("contain", "/analytics");
  });
});
