import selector from "../support/selector";

describe("The Collection Page", () => {
  // Reusable selectors
  const gridItem = (id) =>
    `${selector("FileGridListItem")}[data-file-id=${id}]`;
  const listItem = (id) =>
    `${selector("FileLinearListItem")}[data-file-id=${id}]`;

  beforeEach(() => {
    cy.intercept(
      { pathname: "/api/v1/files", query: { offset: "0" } },
      { fixture: "files_page_0.json" }
    ).as("getFiles(page=0)");

    cy.intercept(
      { pathname: "/api/v1/files", query: { offset: /^[1-9][0-9]*/ } },
      { fixture: "files_page_1.json" }
    ).as("getFiles(page=next)");

    cy.visit("/collection/fingerprints");
  });

  it("should load fingerprints", () => {
    cy.wait(["@getFiles(page=0)"]).then(({ response }) => {
      let files = response.body.items;

      // Check all files are displayed
      for (const file of files) {
        cy.get(gridItem(file.id)).should("contain", file.file_path);
      }

      // Scroll to bottom. This should trigger auto-loading.
      cy.scrollTo("bottom");

      // Wait for the next slice to load
      cy.wait(["@getFiles(page=next)"]).then(({ request, response }) => {
        // Check request offset
        expect(request.url).to.contain(`offset=${files.length}`);

        // Check all files are displayed
        files = files.concat(response.body.items);
        for (const file of files) {
          cy.get(gridItem(file.id)).should("contain", file.file_path);
        }

        // Check total count
        cy.get(selector("ShowAllButton")).should(
          "contain",
          response.body.total
        );

        // Check duplicates count
        cy.get(selector("ShowDuplicatesButton")).should(
          "contain",
          response.body.duplicates
        );

        // Check related count
        cy.get(selector("ShowRelatedButton")).should(
          "contain",
          response.body.related
        );

        // Check unique count
        cy.get(selector("ShowUniqueButton")).should(
          "contain",
          response.body.unique
        );

        // Check navigation
        const file = files[0];
        cy.get(gridItem(file.id)).click();
        cy.url().should("contain", `/collection/fingerprints/${file.id}`);
      });
    });
  });

  it("should render linear list", () => {
    cy.wait(["@getFiles(page=0)"]).then(({ response }) => {
      cy.get(selector("ToggleListView")).click();

      // Check all files are displayed
      let files = response.body.items;
      for (const file of files) {
        cy.get(listItem(file.id)).should("contain", file.file_path);
      }

      // Scroll to bottom. This should trigger auto-loading.
      cy.scrollTo("bottom");

      // Wait for the next slice to load
      cy.wait(["@getFiles(page=next)"]).then(({ request, response }) => {
        // Check request offset
        expect(request.url).to.contain(`offset=${files.length}`);

        // Check all files are also displayed
        files = files.concat(response.body.items);
        for (const file of files) {
          cy.get(listItem(file.id)).should("contain", file.file_path);
        }

        // No grid items are displayed
        cy.get(selector("FileGridListItem")).should("have.length", 0);

        // Check navigation
        const file = files[0];
        cy.get(listItem(file.id)).click();
        cy.url().should("contain", `/collection/fingerprints/${file.id}`);
      });
    });
  });
});
