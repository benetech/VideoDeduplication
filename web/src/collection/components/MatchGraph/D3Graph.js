import * as d3 from "d3";
import { LinkTracker, NodeTracker } from "./tracking";
import { getAdjacency } from "./prepareGraph";

/**
 * Remove all element's children.
 */
function removeChildren(element) {
  while (element.firstChild != null) {
    element.removeChild(element.firstChild);
  }
}

const defaultOptions = {
  nodeRadius: 10,
  highlightHover: false,
};

function edgeWidth(edge) {
  return Math.sqrt(50 * (1 - edge.distance));
}

const colorScheme = {
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

function nodeHoverPainter(hovered, adjacency, scheme) {
  const adjacentColor = color(scheme.normal);
  const nonAdjacentColor = color(scheme.inactive);
  return (node) => {
    if (node.id === hovered.id || adjacency.get(hovered.id).has(node.id)) {
      return adjacentColor(node);
    }
    return nonAdjacentColor(node);
  };
}

function linkHoverPainter(hovered, scheme) {
  const adjacentColor = color(scheme.normal);
  const nonAdjacentColor = color(scheme.inactive);
  return (node) => {
    if (node.id === hovered.source.id || node.id === hovered.target.id) {
      return adjacentColor(node);
    }
    return nonAdjacentColor(node);
  };
}

function color(scheme) {
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

const noop = () => {};

export default class D3Graph {
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
    options = {},
  }) {
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
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.adjacency = getAdjacency(links, nodes);
    this._tracker = null;
  }

  /**
   * Display graph.
   */
  display() {
    this.simulation = this._createForceSimulation();

    removeChildren(this.container);

    let svg = d3
      .select(this.container)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("viewBox", [0, 0, this.width, this.height])
      .classed(this.classes.content, true)
      .call(
        d3.zoom().on("zoom", function (event) {
          svg.attr("transform", event.transform);
        })
      )
      .append("g");

    // Bind this for legacy context handling
    const self = this;

    const links = svg
      .append("g")
      .attr("stroke", "#999")
      .selectAll("line")
      .data(this.links)
      .join("line")
      .attr("stroke-opacity", (d) => 1 - d.distance)
      .attr("opacity", 1.0)
      .attr("stroke-width", (d) => edgeWidth(d))
      .on("click", (_, edge) => {
        this.onClickEdge({ source: edge.source.id, target: edge.target.id });
      })
      .style("cursor", "pointer");

    const nodes = svg
      .append("g")
      .attr("stroke", "rgba(0,0,0,0)")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(this.nodes)
      .join("circle")
      .attr("r", this.options.nodeRadius)
      .attr("fill", color(colorScheme.normal))
      .call(this._createDrag(this.simulation))
      .on("click", (_, node) => {
        this.onClickNode(node);
      })
      .style("cursor", "pointer");

    // Define mouse hover listeners for links
    links
      .on("mouseenter", function (event, edge) {
        self.tracker = self.makeLinkTracker(this, edge);
        self.tracker.track(event);
        if (self.options.highlightHover) {
          nodes.attr("fill", linkHoverPainter(edge, colorScheme));
          links.attr("opacity", (ln) => (ln === edge ? 1.0 : 0.4));
        }
      })
      .on("mouseleave", function () {
        self.tracker = null;
        if (self.options.highlightHover) {
          nodes.attr("fill", color(colorScheme.normal));
          links.attr("opacity", 1.0);
        }
      });

    // Define mouse hover listeners for links
    nodes
      .on("mouseenter", function (event, node) {
        self.tracker = self.makeNodeTracker(this, node);
        self.tracker.track(event);
        if (self.options.highlightHover) {
          nodes.attr(
            "fill",
            nodeHoverPainter(node, self.adjacency, colorScheme)
          );
          links.attr("opacity", (ln) =>
            ln.source.id === node.id || ln.target.id === node.id ? 1.0 : 0.4
          );
        }
      })
      .on("mouseleave", function (event, node) {
        self.tracker = null;
        if (self.options.highlightHover) {
          nodes.attr("fill", color(colorScheme.normal));
          links.attr("opacity", 1.0);
        }
      });

    this.simulation.on("tick", () => {
      links
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      this.tracker?.track();
    });

    this.updateSize = () => {
      this.width = this.container?.clientWidth;
      this.height = this.container?.clientHeight;
      svg
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("viewBox", [0, 0, this.width, this.height])
        .classed(this.classes.content, true);
      this.simulation.force(
        "center",
        d3.forceCenter(this.width / 2, this.height / 2)
      );
      this.simulation.restart();
    };
    window.addEventListener("resize", this.updateSize);
  }

  /**
   * Define a drag behavior.
   *
   * See https://github.com/d3/d3-drag/blob/v2.0.0/README.md#drag.
   */
  _createDrag(simulation) {
    const dragStarted = (event) => {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      this.tracker?.track();
    };

    const dragged = (event) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      this.tracker?.track();
    };

    const dragEnded = (event) => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      event.subject.fx = null;
      event.subject.fy = null;
      this.tracker?.track();
    };

    return d3
      .drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded);
  }

  /**
   * Create a force simulation.
   *
   * See https://github.com/d3/d3-force/blob/v2.1.1/README.md#forceSimulation
   */
  _createForceSimulation() {
    return d3
      .forceSimulation(this.nodes)
      .force(
        "link",
        d3
          .forceLink(this.links)
          .id((d) => d.id)
          .strength((d) => 1 - d.distance)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));
  }

  get tracker() {
    return this._tracker;
  }

  set tracker(tracker) {
    if (this._tracker != null) {
      this._tracker.remove();
    }
    this._tracker = tracker;
  }

  /**
   * Remove graph elements, remove all listeners, clear container.
   */
  cleanup() {
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

  makeNodeTracker(element, node) {
    return new NodeTracker(
      element,
      node,
      this.onMouseOverNode,
      this.onMouseOutNode
    );
  }

  makeLinkTracker(element, link) {
    return new LinkTracker(
      element,
      link,
      this.onMouseOverLink,
      this.onMouseOutLink
    );
  }
}
