import * as d3 from "d3";
import {
  LinkTracker,
  MoveHandler,
  MoveTracker,
  NodeTracker,
  RemoveHandler,
} from "./tracking";
import { getAdjacency } from "./prepareGraph";
import { AdjacencyTable, ClusterLink, ClusterNode } from "./model";
import { ClassNameMap } from "@material-ui/styles";
import { VideoFile } from "../../../model/VideoFile";
import getEntityId from "../../../lib/entity/getEntityId";

/**
 * Get link's incident node's x coordinate.
 */
function getX(node: ClusterNode | ClusterNode["id"]): number {
  if (typeof node === "number") {
    return 0;
  }
  return node.x || 0;
}

/**
 * Get link's incident node's x coordinate.
 */
function getY(node: ClusterNode | ClusterNode["id"]): number {
  if (typeof node === "number") {
    return 0;
  }
  return node.y || 0;
}

/**
 * Remove all element's children.
 */
function removeChildren(element: SVGElement) {
  while (element.firstChild != null) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Get link distance.
 */
function edgeWidth(edge: ClusterLink): number {
  return Math.sqrt(50 * (1 - 0.8 * edge.distance));
}

/**
 * Neighboring nodes colors.
 */
export type NodesColors = {
  origin: string;
  child: string;
  grandChild: string;
};

/**
 * D3Graph color scheme type.
 */
export type ColorScheme = {
  normal: NodesColors;
  inactive: NodesColors;
};

/**
 * Default graph color scheme.
 */
const colorScheme: ColorScheme = {
  normal: {
    origin: "#000000",
    child: "#F75537",
    grandChild: "#FF846D",
  },
  inactive: {
    origin: "#5F5F5F",
    child: "#F9C8BF",
    grandChild: "#FBD6CF",
  },
};

function nodeHoverPainter(
  hovered: ClusterNode,
  adjacency: AdjacencyTable,
  scheme: ColorScheme
): GetColorFn<ClusterNode> {
  const adjacentColor = color(scheme.normal);
  const nonAdjacentColor = color(scheme.inactive);
  return (node: ClusterNode) => {
    if (node.id === hovered.id || adjacency.get(hovered.id)?.has(node.id)) {
      return adjacentColor(node);
    }
    return nonAdjacentColor(node);
  };
}

function linkHoverPainter(
  hovered: ClusterLink,
  scheme: ColorScheme
): GetColorFn<ClusterNode> {
  const adjacentColor = color(scheme.normal);
  const nonAdjacentColor = color(scheme.inactive);
  return (node) => {
    if (
      node.id === getEntityId(hovered.source) ||
      node.id === getEntityId(hovered.target)
    ) {
      return adjacentColor(node);
    }
    return nonAdjacentColor(node);
  };
}

/**
 * Get color by data.
 */
type GetColorFn<TDatum> = (data: TDatum) => string;

/**
 * Get node painter.
 */
function color(scheme: NodesColors): GetColorFn<ClusterNode> {
  return (node) => {
    switch (node.generation) {
      case 0:
        return scheme.origin;
      case 1:
        return scheme.child;
      default:
        return scheme.grandChild;
    }
  };
}

const noop = () => null;

/**
 * Link data descriptor.
 */
export type LinkDescr = {
  source: VideoFile["id"];
  target: VideoFile["id"];
};

/**
 * Parent SVG element selection.
 */
type SVGSelection = d3.Selection<SVGGElement, unknown, null, undefined>;

/**
 * Shorthand alias for D3 link selection.
 */
type LinkSelection = d3.Selection<
  SVGLineElement,
  ClusterLink,
  SVGGElement,
  unknown
>;

/**
 * Shorthand alias for D3 node selection.
 */
type NodeSelection = d3.Selection<
  SVGCircleElement,
  ClusterNode,
  SVGGElement,
  unknown
>;

/**
 * Shorthand alias for node dragging event.
 */
type NodeDragEvent = d3.D3DragEvent<SVGCircleElement, ClusterNode, ClusterNode>;

export type D3GraphOptions = {
  links: ClusterLink[];
  nodes: ClusterNode[];
  container: SVGElement;
  classes?: Partial<ClassNameMap<"content" | "tooltip">>;
  onClickNode?: (node: ClusterNode) => void;
  onMouseOverNode?: MoveHandler<ClusterNode>;
  onMouseOutNode?: RemoveHandler<ClusterNode>;
  onMouseOverLink?: MoveHandler<ClusterLink>;
  onMouseOutLink?: RemoveHandler<ClusterLink>;
  onClickEdge?: (link: LinkDescr) => void;
  nodeRadius?: number;
  highlightHover?: boolean;
};

export default class D3Graph {
  private readonly links: ClusterLink[];
  private readonly nodes: ClusterNode[];
  private readonly container: SVGElement;
  private readonly classes: Partial<ClassNameMap<"content">>;
  private readonly onClickNode: (node: ClusterNode) => void;
  private readonly onMouseOverNode: MoveHandler<ClusterNode>;
  private readonly onMouseOutNode: RemoveHandler<ClusterNode>;
  private readonly onMouseOverLink: MoveHandler<ClusterLink>;
  private readonly onMouseOutLink: RemoveHandler<ClusterLink>;
  private readonly onClickEdge: (link: LinkDescr) => void;
  private width: number;
  private height: number;
  private readonly nodeRadius: number;
  private readonly highlightHover: boolean;
  private readonly adjacency: AdjacencyTable;
  private _tracker: MoveTracker | null;
  private updateSize: (() => void) | null;
  private simulation: d3.Simulation<ClusterNode, ClusterLink> | null;

  constructor({
    links,
    nodes,
    container,
    classes = {},
    onClickNode = noop,
    onMouseOverNode = noop,
    onMouseOutNode = noop,
    onMouseOverLink = noop,
    onMouseOutLink = noop,
    onClickEdge = noop,
    nodeRadius = 10,
    highlightHover = false,
  }: D3GraphOptions) {
    this.links = links.map(Object.create);
    this.nodes = nodes.map(Object.create);
    this.width = container?.clientWidth;
    this.height = container?.clientHeight;
    this.container = container;
    this.classes = classes;
    this.updateSize = null;
    this.simulation = null;
    this.onClickNode = onClickNode;
    this.onClickEdge = onClickEdge;
    this.onMouseOverNode = onMouseOverNode;
    this.onMouseOutNode = onMouseOutNode;
    this.onMouseOverLink = onMouseOverLink;
    this.onMouseOutLink = onMouseOutLink;
    this.nodeRadius = nodeRadius;
    this.highlightHover = highlightHover;
    this.adjacency = getAdjacency(links, nodes);
    this._tracker = null;
  }

  /**
   * Display graph.
   */
  display(): void {
    this.simulation = this.createForceSimulation();

    removeChildren(this.container);

    let svg: SVGSelection = d3
      .select(this.container)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .call(
        d3.zoom<SVGElement, unknown>().on("zoom", function (event) {
          svg.attr("transform", event.transform);
        })
      )
      .append("g");

    if (this.classes.content != null) {
      svg = svg.classed(this.classes.content, true);
    }

    const links: LinkSelection = svg
      .append("g")
      .attr("stroke", "#999")
      .selectAll<SVGLineElement, ClusterLink>("line")
      .data(this.links)
      .join("line")
      .attr("stroke-opacity", (d: ClusterLink) => 1 - 0.8 * d.distance)
      .attr("opacity", 1.0)
      .attr("stroke-width", edgeWidth);

    const hitBoxLinks: LinkSelection = svg
      .append("g")
      .selectAll<SVGLineElement, ClusterLink>("line")
      .data(this.links)
      .join("line")
      .attr("stroke-width", 10)
      .attr("stroke", "rgba(0,0,0,0)")
      .style("cursor", "pointer");

    const nodes: NodeSelection = svg
      .append("g")
      .attr("stroke", "rgba(0,0,0,0)")
      .attr("stroke-width", 1.5)
      .selectAll<SVGCircleElement, ClusterNode>("circle")
      .data(this.nodes)
      .join("circle")
      .attr("r", this.nodeRadius)
      .attr("fill", color(colorScheme.normal))
      .call(this.createDrag(this.simulation))
      .style("cursor", "pointer");

    this.hookNodeEvents(nodes, links);
    this.hookLinksEvents(links, links, nodes);
    this.hookLinksEvents(hitBoxLinks, links, nodes);

    this.simulation.on("tick", () => {
      links
        .attr("x1", (d: ClusterLink) => getX(d.source))
        .attr("y1", (d: ClusterLink) => getY(d.source))
        .attr("x2", (d: ClusterLink) => getX(d.target))
        .attr("y2", (d: ClusterLink) => getY(d.target));

      hitBoxLinks
        .attr("x1", (d: ClusterLink) => getX(d.source))
        .attr("y1", (d: ClusterLink) => getY(d.source))
        .attr("x2", (d: ClusterLink) => getX(d.target))
        .attr("y2", (d: ClusterLink) => getY(d.target));

      nodes
        .attr("cx", (d: ClusterNode) => d.x || 0)
        .attr("cy", (d: ClusterNode) => d.y || 0);
      this.tracker?.track();
    });

    this.updateSize = () => {
      this.width = this.container?.clientWidth;
      this.height = this.container?.clientHeight;
      this.simulation?.force(
        "center",
        d3.forceCenter(this.width / 2, this.height / 2)
      );
      this.simulation?.restart();
    };
    window.addEventListener("resize", this.updateSize);
  }

  private hookNodeEvents(nodes: NodeSelection, links: LinkSelection) {
    /* eslint-disable  @typescript-eslint/no-this-alias */
    const self = this;

    // Define mouse hover listeners for nodes
    nodes
      .on("mouseenter", function (event, node) {
        self.tracker = self.makeNodeTracker(this, node);
        self.tracker.track(event);
        if (self.highlightHover) {
          nodes.attr(
            "fill",
            nodeHoverPainter(node, self.adjacency, colorScheme)
          );
          links.attr("opacity", (ln) =>
            getEntityId(ln.source) === node.id ||
            getEntityId(ln.target) === node.id
              ? 1.0
              : 0.4
          );
        }
      })
      .on("mouseleave", function () {
        self.tracker = null;
        if (self.highlightHover) {
          nodes.attr("fill", color(colorScheme.normal));
          links.attr("opacity", 1.0);
        }
      })
      .on("click", (_, node) => {
        this.onClickNode(node);
      });
  }

  private hookLinksEvents(
    targetLinks: LinkSelection,
    displayLinks: LinkSelection,
    nodes: NodeSelection
  ) {
    /* eslint-disable  @typescript-eslint/no-this-alias */
    const self = this;

    // Define mouse hover listeners for links
    targetLinks
      .on("mouseenter", function (event, edge) {
        if (this != null) {
          self.tracker = self.makeLinkTracker(this, edge);
          self.tracker.track(event);
          if (self.highlightHover) {
            nodes.attr("fill", linkHoverPainter(edge, colorScheme));
            displayLinks.attr("opacity", (ln) => (ln === edge ? 1.0 : 0.4));
          }
        }
      })
      .on("mouseleave", function () {
        self.tracker = null;
        if (self.highlightHover) {
          nodes.attr("fill", color(colorScheme.normal));
          displayLinks.attr("opacity", 1.0);
        }
      })
      .on("click", (_, edge) => {
        this.onClickEdge({
          source: getEntityId<ClusterNode>(edge.source),
          target: getEntityId<ClusterNode>(edge.target),
        });
      });
  }

  /**
   * Define a drag behavior.
   *
   * See https://github.com/d3/d3-drag/blob/v2.0.0/README.md#drag.
   */
  private createDrag(
    simulation: d3.Simulation<ClusterNode, ClusterLink>
  ): (selection: NodeSelection) => void {
    const dragStarted = (event: NodeDragEvent) => {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      this.tracker?.track();
    };

    const dragged = (event: NodeDragEvent) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      this.tracker?.track();
    };

    const dragEnded = (event: NodeDragEvent) => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      event.subject.fx = null;
      event.subject.fy = null;
      this.tracker?.track();
    };

    return d3
      .drag<SVGCircleElement, ClusterNode>()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded);
  }

  /**
   * Create a force simulation.
   *
   * See https://github.com/d3/d3-force/blob/v2.1.1/README.md#forceSimulation
   */
  private createForceSimulation(): d3.Simulation<ClusterNode, ClusterLink> {
    return d3
      .forceSimulation(this.nodes)
      .force(
        "link",
        d3
          .forceLink<ClusterNode, ClusterLink>(this.links)
          .id((d) => d.id)
          .strength((d) => 1 - d.distance)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));
  }

  private get tracker() {
    return this._tracker;
  }

  private set tracker(tracker) {
    if (this._tracker != null) {
      this._tracker.remove();
    }
    this._tracker = tracker;
  }

  /**
   * Remove graph elements, remove all listeners, clear container.
   */
  cleanup(): void {
    removeChildren(this.container);
    if (this.updateSize != null) {
      window.removeEventListener("resize", this.updateSize);
      this.updateSize = null;
    }
    if (this.simulation != null) {
      this.simulation.stop();
      this.simulation = null;
    }
  }

  private makeNodeTracker(element: SVGElement, node: ClusterNode): NodeTracker {
    return new NodeTracker(
      element,
      node,
      this.onMouseOverNode,
      this.onMouseOutNode
    );
  }

  private makeLinkTracker(element: SVGElement, link: ClusterLink): LinkTracker {
    return new LinkTracker(
      element,
      link,
      this.onMouseOverLink,
      this.onMouseOutLink
    );
  }
}
