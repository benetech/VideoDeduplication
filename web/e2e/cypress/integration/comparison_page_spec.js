import selector from "../support/selector";

describe("The File Comparison Page", () => {
  // Mother file id
  const fileId = 1;

  // Reusable selectors
  const motherHeader = selector("MotherFileHeader");
  const matchHeader = selector("MatchHeader");
  const fileDetails = (fileId) =>
    `${selector("FileDetails")}[data-file-id=${fileId}]`;

  // Execute test logic when all data is loaded.
  // This is a reusable pattern to make the test logic more clear.
  const waitDataLoaded = (callback) => {
    cy.wait(["@getFile"]).then(({ response }) => {
      // Get mother file from the response
      const file = response.body;
      cy.wait("@getMatches(page=0)").then(({ response }) => {
        // Get matches from the response
        let matches = response.body.items;
        cy.wait("@getMatches(page=next)").then(({ request, response }) => {
          // Check request offset
          expect(request.url).to.contain(`offset=${matches.length}`);

          // Get the remaining matches from the response
          matches = matches.concat(response.body.items);

          // Execute actual test logic
          callback(file, matches);
        });
      });
    });
  };

  beforeEach(() => {
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

    cy.visit(`/collection/fingerprints/${fileId}/compare`);
  });

  it("displays mother file and all matches", () => {
    waitDataLoaded((file, matches) => {
      cy.get(motherHeader).should("contain", file.file_path);
      cy.get(fileDetails(file.id)).should("be.visible");
    });
  });
});
