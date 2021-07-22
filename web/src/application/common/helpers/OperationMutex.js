/**
 * Operation controller that cancels previous operation when new one is started.
 */
export default class OperationMutex {
  constructor(cancel = null) {
    this._cancel = cancel;
  }

  cancel() {
    if (this._cancel != null) {
      this._cancel();
      this._cancel = null;
    }
  }

  begin(cancel) {
    this.cancel();
    this._cancel = cancel;
  }
}
