import selector from "../support/selector";

describe("The File Matches Page", () => {
  // Define reusable selectors
  const preview = (fileId) =>
    `${selector("MatchPreview")}[data-file-id=${fileId}]`;

  // Mother file id
  const fileId = 1;

  const setupInterception = () => {
    cy.intercept(`/api/v1/files/${fileId}?`, {
      fixture: "file.json",
    }).as("getFile");

    cy.intercept(
      { pathname: `/api/v1/files/${fileId}/matches`, query: { offset: "0" } },
      { fixture: "matches_page_0.json" }
    ).as("getMatches(page=0)");

    cy.intercept(
      {
        pathname: `/api/v1/files/${fileId}/matches`,
        query: { offset: /^[1-9][0-9]*/ },
      },
      { fixture: "matches_page_1.json" }
    ).as("getMatches(page=next)");
  };

  // Verify all matches are displayed correctly
  const testMatchesLoaded = (file) => {
    // Check summary is displayed
    cy.get(selector("FileSummaryHeader")).should("contain", file.file_path);

    cy.wait("@getMatches(page=0)").then(({ response }) => {
      // Check matches are displayed
      let matches = response.body.items;
      for (let match of matches) {
        cy.get(preview(match.file.id)).should("contain", match.file.file_path);
      }
      cy.get(selector("MatchPreview")).should("have.length", matches.length);

      // Scroll to the bottom to trigger the next page loading
      cy.scrollTo("bottom");

      cy.wait("@getMatches(page=next)").then(({ request, response }) => {
        // Check request offset
        expect(request.url).to.contain(`offset=${matches.length}`);

        // Check all matches are displayed
        matches = matches.concat(response.body.items);
        for (let match of matches) {
          cy.get(preview(match.file.id)).should(
            "contain",
            match.file.file_path
          );
        }
        cy.get(selector("MatchPreview")).should("have.length", matches.length);

        // Check navigates to compare page
        const match = matches[0];
        cy.get(preview(match.file.id)).contains("Compare").click();
        cy.url().should(
          "contain",
          `/collection/fingerprints/${file.id}/compare/${match.file.id}`
        );
      });
    });
  };

  it("loads the file and all its matches", () => {
    // Visit matches page
    setupInterception();
    cy.visit(`/collection/fingerprints/${fileId}/matches`);

    cy.wait("@getFile").then(({ response }) => {
      const file = response.body;

      // Check summary is displayed
      cy.get(selector("FileSummaryHeader")).should("contain", file.file_path);

      // Wait for the first matches slice to load
      testMatchesLoaded(file);
    });
  });

  it("loads matches when visited from other page", () => {
    // Visit file details page
    setupInterception();
    cy.visit(`/collection/fingerprints/${fileId}`);

    cy.wait("@getFile").then(({ response }) => {
      const file = response.body;

      // Navigate to matches page
      cy.contains("Files Matched").click();

      // Wait for the first matches slice to load
      testMatchesLoaded(file);
    });
  });
});
