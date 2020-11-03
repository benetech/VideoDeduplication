/**
 * Class to calculate position relative to node.
 */
export class NodeTracker {
  constructor(element, node, onMove, onRemove) {
    this.element = element;
    this.node = node;
    this.onMove = onMove;
    this.onRemove = onRemove;
  }

  /**
   * Call move listener.
   */
  track() {
    const clientRect = this.element.getBoundingClientRect();
    const position = {
      top: clientRect.top,
      left: clientRect.left + clientRect.width,
    };
    this.onMove(this.element, this.node, position);
  }

  remove() {
    this.onRemove(this.element, this.node);
  }
}

/**
 * Class to calculate position relative to link.
 */
export class LinkTracker {
  constructor(element, link, onMove, onRemove) {
    this.element = element;
    this.link = link;
    this.onMove = onMove;
    this.onRemove = onRemove;
  }

  /**
   * Call move listener.
   */
  track(event) {
    if (event == null) {
      return;
    }
    const position = {
      top: event.clientY,
      left: event.clientX,
    };
    this.onMove(this.element, this.link, position);
  }

  remove() {
    this.onRemove(this.element, this.link);
  }
}
