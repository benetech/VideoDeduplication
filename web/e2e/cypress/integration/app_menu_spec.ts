import selector from "../support/selector";

describe("Application Sidebar Menu", () => {
  // Menu elements selectors
  const menu = selector("AppMenu");
  const toggle = selector("AppMenuToggle");
  const item = (text: string): string =>
    `${selector("AppMenuItem")}:contains("${text}")`;

  beforeEach(() => {
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
