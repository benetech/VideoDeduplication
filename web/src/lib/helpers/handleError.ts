/**
 * Handle error helper.
 */
export default function handleError(raise: boolean, error: Error | unknown) {
  if (raise) {
    throw error;
  }
  console.log(error);
}
