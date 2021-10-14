// Define custom commands. See https://docs.cypress.io/api/cypress-api/custom-commands.html

import selector from "./selector";

Cypress.Commands.add("selector", (name: string, ...args: any[]) => {
  return cy.get(selector(name), ...args);
});
