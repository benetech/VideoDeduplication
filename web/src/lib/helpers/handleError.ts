/**
 * Handle error helper.
 */
export default function handleError(
  raise: boolean,
  error: Error | unknown
): void {
  if (raise) {
    throw error;
  }
  console.log(error);
}
