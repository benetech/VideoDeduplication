import { ClusterLink, ClusterNode, Position } from "./model";
import React from "react";

/**
 * Element move handler.
 */
export type MoveHandler<TData> = (
  element: HTMLElement | SVGElement,
  data: TData,
  position: Position
) => void;

/**
 * Element deletion handler.
 */
export type RemoveHandler<TData> = (
  element: HTMLElement | SVGElement,
  data: TData
) => void;

/**
 * Generic interface for movement trackers.
 */
export interface MoveTracker {
  track(event?: React.MouseEvent): void;
  remove(): void;
}

/**
 * Class to calculate position relative to node.
 */
export class NodeTracker implements MoveTracker {
  private readonly element: HTMLElement | SVGElement;
  private readonly node: ClusterNode;
  private readonly onMove: MoveHandler<ClusterNode>;
  private readonly onRemove: RemoveHandler<ClusterNode>;

  constructor(
    element: HTMLElement | SVGElement,
    node: ClusterNode,
    onMove: MoveHandler<ClusterNode>,
    onRemove: RemoveHandler<ClusterNode>
  ) {
    this.element = element;
    this.node = node;
    this.onMove = onMove;
    this.onRemove = onRemove;
  }

  /**
   * Call move listener.
   */
  track(): void {
    const clientRect = this.element.getBoundingClientRect();
    const position = {
      top: clientRect.top,
      left: clientRect.left + clientRect.width,
    };
    this.onMove(this.element, this.node, position);
  }

  remove(): void {
    this.onRemove(this.element, this.node);
  }
}

/**
 * Class to calculate position relative to link.
 */
export class LinkTracker implements MoveTracker {
  private readonly element: HTMLElement | SVGElement;
  private readonly link: ClusterLink;
  private readonly onMove: MoveHandler<ClusterLink>;
  private readonly onRemove: RemoveHandler<ClusterLink>;

  constructor(
    element: HTMLElement | SVGElement,
    link: ClusterLink,
    onMove: MoveHandler<ClusterLink>,
    onRemove: RemoveHandler<ClusterLink>
  ) {
    this.element = element;
    this.link = link;
    this.onMove = onMove;
    this.onRemove = onRemove;
  }

  /**
   * Call move listener.
   */
  track(event?: React.MouseEvent): void {
    if (event == null) {
      return;
    }
    const position = {
      top: event.clientY,
      left: event.clientX,
    };
    this.onMove(this.element, this.link, position);
  }

  remove(): void {
    this.onRemove(this.element, this.link);
  }
}
