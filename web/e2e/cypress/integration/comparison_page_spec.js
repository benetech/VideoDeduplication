import selector from "../support/selector";
import lodash from "lodash";

describe("The File Comparison Page", () => {
  // Mother file id
  const fileId = 1;

  // Reusable selectors
  const motherHeader = selector("MotherFileHeader");
  const matchHeader = selector("MatchHeader");
  const prevMatch = selector("PrevMatchButton");
  const nextMatch = selector("NextMatchButton");
  const menu = selector("MatchSelectorMenu");
  const menuItem = (fileId) =>
    `${selector("MatchSelectorMenuItem")}[data-file-id=${fileId}]`;
  const fileDetails = (fileId) =>
    `${selector("FileDetails")}[data-file-id=${fileId}]`;
  const matchFiles = selector("MatchFiles");
  const objectTab = selector("ObjectsTab");
  const objectButton = (objectId) =>
    `${selector("ObjectListItemButton")}[data-object-id=${objectId}]`;

  // Matches must be sorted by distance (ascending) and by name.
  const expectedMatchOrder = (first, second) => {
    if (first.distance < second.distance) {
      return -1;
    } else if (first.distance > second.distance) {
      return 1;
    } else {
      return String(first.file.filename).localeCompare(second.file.filename);
    }
  };

  // Intercept template-matches requests
  const interceptTemplateMatches = (callback) => {
    cy.fixture("matches_page_0.json").then((matches0) => {
      cy.fixture("matches_page_1.json").then((matches1) => {
        cy.fixture("template_matches.json").then((templateMatchesFixture) => {
          const matches = [...matches0.items, ...matches1.items];

          const templateMatches = new Map();

          // Intercept template matches for each matched file
          for (const [index, match] of matches.entries()) {
            // Prepare expected response
            const response = lodash.cloneDeep(templateMatchesFixture);
            response.items[0].id = index;
            response.items[0].file_id = match.file.id;

            // Save expected template matches...
            templateMatches.set(match.file.id, response);

            // Configure interception
            console.log("Intercepting template matches for", match);
            cy.intercept(
              {
                pathname: `/api/v1/template_matches`,
                query: { file_id: `${match.file.id}` },
              },
              response
            ).as(`getTemplateMatches_${match.file.id}`);
          }

          // Execute callback when interception is configured
          callback(templateMatches);
        });
      });
    });
  };

  // Assert mother file and match are displayed on the page.
  const checkDisplayed = (motherFile, match) => {
    cy.url().should("include", match.file.id);
    cy.get(motherHeader).should("contain", motherFile.file_path);
    cy.get(fileDetails(motherFile.id)).should("be.visible");
    cy.get(matchHeader).should("contain", match.file.file_path);
    cy.get(fileDetails(match.file.id)).should("be.visible");
  };

  // Assert template matches are displayed correctly
  const checkObjects = (objects) => {
    cy.get(matchFiles).find(objectTab).should("be.visible").click();
    for (const object of objects) {
      cy.get(objectButton(object.id)).should("be.visible");
    }
  };

  // Execute test logic when all data is loaded.
  // This is a reusable pattern to make the test logic more clear.
  const waitDataLoaded = (callback) => {
    // Ensure template-matches are intercepted
    interceptTemplateMatches((templateMatches) => {
      cy.visit(`/collection/fingerprints/${fileId}/compare`);

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
            callback(file, matches, templateMatches);
          });
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
  });

  it("displays mother file and all matches", () => {
    waitDataLoaded((motherFile, matches, templateMatches) => {
      cy.get(motherHeader).should("contain", motherFile.file_path);
      cy.get(fileDetails(motherFile.id)).should("be.visible");

      // Impose expected order on matches array.
      matches.sort(expectedMatchOrder);

      // Iterate over matches using the next-match button
      for (const [index, match] of matches.entries()) {
        checkDisplayed(motherFile, match);
        cy.wait([`@getTemplateMatches_${match.file.id}`]);
        checkObjects(templateMatches.get(match.file.id).items);
        if (index < matches.length - 1) {
          cy.get(nextMatch).click();
        } else {
          cy.get(nextMatch).should("be.disabled");
        }
      }

      // Iterate over matches in backward direction using prev-match button
      const reversedMatches = [...matches.entries()].reverse();
      for (const [index, match] of reversedMatches) {
        checkDisplayed(motherFile, match);
        if (index > 0) {
          cy.get(prevMatch).click();
        } else {
          cy.get(prevMatch).should("be.disabled");
        }
      }

      // Iterate over matches using drop-down menu
      for (const match of matches) {
        cy.get(menu).click();
        cy.get(menuItem(match.file.id))
          .should("contain", match.file.file_path)
          .click();
        checkDisplayed(motherFile, match);
      }
    });
  });
});
