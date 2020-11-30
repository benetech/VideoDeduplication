// Define custom commands. See https://docs.cypress.io/api/cypress-api/custom-commands.html

import selector from "./selector";

Cypress.Commands.add("selector", (name, ...args) => {
  return cy.get(selector(name), ...args);
});
