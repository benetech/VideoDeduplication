/**
 * Handle error helper.
 * @param {boolean} raise indicates whether the error should be thrown.
 * @param {Error} error caught error
 */
export default function handleError(raise, error) {
  if (raise) {
    throw error;
  }
  console.log(error);
}
