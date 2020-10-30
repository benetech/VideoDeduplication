import * as d3 from "d3";
import { formatDuration } from "../../../common/helpers/format";
import { basename } from "../../../common/helpers/paths";

/**
 * Remove all element's children.
 */
function removeChildren(element) {
  while (element.firstChild != null) {
    element.removeChild(element.firstChild);
  }
}

const defaultOptions = {
  nodeRadius: 15,
};

/**
 * Class to calculate position relative to node.
 */
class NodeTracker {
  constructor(node, indent) {
    this.node = node;
    this.indent = { x: 0, y: 0, ...indent };
  }
  track() {
    return [this.node.x + this.indent.x, this.node.y + this.indent.y];
  }
}

/**
 * Class to calculate position relative to mouse pointer.
 */
class MouseTracker {
  constructor(indent) {
    this.indent = { x: 0, y: 0, ...indent };
  }
  track(event, element) {
    if (event == null) {
      return [undefined, undefined];
    }
    const [x, y] = d3.pointer(event, element);
    return [x + this.indent.x, y + this.indent.y];
  }
}

class Tooltip {
  constructor({ text, container, tracker }) {
    this.tracker = tracker;
    this.text = container.append("text").text(text);
  }

  move(event) {
    const [x, y] = this.tracker.track(event, this.text.node());
    if (x != null && y != null) {
      this.text.attr("x", x).attr("y", y);
    }
  }

  remove() {
    this.text.remove();
  }
}

function edgeWidth(edge) {
  return Math.sqrt(100 * (1 - edge.distance));
}

function fileTooltip(file) {
  const filename = basename(file.filename);
  const duration = formatDuration(file.metadata.length, null, false);
  return `${filename} - ${duration}`;
}

const colorScheme = {
  1: "#2ca02c",
  2: "#1f77b4",
  3: "#ff7f0e",
};

export default class D3Graph {
  constructor({
    links,
    nodes,
    container,
    classes = {},
    onClick = () => {},
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
    this.onClick = onClick;
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this._tooltip = null;
  }

  /**
   * Display graph.
   */
  display() {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    const color = (d) => colorScheme[d.group] || scale(d.group);

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

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .selectAll("line")
      .data(this.links)
      .join("line")
      .attr("stroke-opacity", (d) => 1 - d.distance)
      .attr("stroke-width", (d) => edgeWidth(d))
      .on("mouseover", function (event, edge) {
        d3.select(this).attr("stroke-width", (d) => 1.5 * edgeWidth(d));
        self.tooltip = new Tooltip({
          text: edge.distance.toFixed(4),
          container: svg,
          tracker: new MouseTracker({ x: 15 }),
        });
        self.tooltip.move(event);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", (d) => edgeWidth(d));
        self.tooltip = null;
      })
      .style("cursor", "pointer");

    const node = svg
      .append("g")
      .attr("stroke", "rgba(0,0,0,0)")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(this.nodes)
      .join("circle")
      .attr("r", this.options.nodeRadius)
      .attr("fill", color)
      .call(this._createDrag(this.simulation))
      .on("click", (_, data) => {
        const node = this.nodes[data.index];
        this.onClick(node);
      })
      .on("mouseover", function (event, node) {
        d3.select(this).attr("r", self.options.nodeRadius * 1.5);

        self.tooltip = new Tooltip({
          text: fileTooltip(node.file),
          container: svg,
          tracker: new NodeTracker(node, {
            x: self.options.nodeRadius * 2,
            y: self.options.nodeRadius * 0.25,
          }),
        });
        self.tooltip.move(event);
      })
      .on("mouseout", function () {
        self.tooltip = null;
        d3.select(this).attr("r", self.options.nodeRadius);
      })
      .style("cursor", "pointer");

    // node.append("title").text((data) => {
    //   const filename = basename(data.file.filename);
    //   const duration = formatDuration(data.file.metadata.length, null, false);
    //   return `${filename} ${duration}`;
    // });
    //
    // link.append("title").text((data) => data.distance.toFixed(4));

    this.simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      this.tooltip?.move();
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
      this.tooltip?.move(event);
    };

    const dragged = (event) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      this.tooltip?.move(event);
    };

    const dragEnded = (event) => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      event.subject.fx = null;
      event.subject.fy = null;
      this.tooltip?.move(event);
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
          .strength((d) => 0.1 * (1 - d.distance))
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));
  }

  get tooltip() {
    return this._tooltip;
  }

  set tooltip(tooltip) {
    if (this._tooltip != null) {
      this._tooltip.remove();
    }
    this._tooltip = tooltip;
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
}
