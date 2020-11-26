import selector from "../support/selector";

describe("The Home Page", () => {
  it("redirects to dashboard", () => {
    cy.visit("/");

    // We should be redirected to dashboard
    cy.url().should("include", "/analytics");

    // The Dashboard page should be displayed
    cy.get(selector("PageHeader")).should("contain", "Dashboard");
  });
});
