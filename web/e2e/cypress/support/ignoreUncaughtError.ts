export function withMessage(
  pattern: string | RegExp
): (error: Error) => boolean {
  return (error: Error) => {
    if (typeof pattern === "string") {
      return error.message.includes(pattern);
    } else {
      return Boolean(error.message.match(pattern));
    }
  };
}

export default function ignoreUncaughtError(
  predicate: (err: Error) => boolean
) {
  cy.on("uncaught:exception", (err) => {
    if (predicate(err)) {
      return false;
    }
  });
}
