import * as d3 from "d3";

/**
 * Remove all element's children.
 */
function removeChildren(element) {
  while (element.firstChild != null) {
    element.removeChild(element.firstChild);
  }
}

export default class D3Graph {
  constructor({ links, nodes, container, classes = {} }) {
    this.links = links.map(Object.create);
    this.nodes = nodes.map(Object.create);
    this.width = container?.clientWidth;
    this.height = container?.clientHeight;
    this.container = container;
    this.classes = classes;
    this.updateSize = null;
    this.simulation = null;
  }

  /**
   * Display graph.
   */
  display() {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    const color = (d) => scale(d.group);

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

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(this.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(100 * (1 - d.distance)));

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(this.nodes)
      .join("circle")
      .attr("r", 15)
      .attr("fill", color)
      .call(this._createDrag(this.simulation));

    node.append("title").text((d) => d.id);

    this.simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
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
    };

    const dragged = (event) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    };

    const dragEnded = (event) => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      event.subject.fx = null;
      event.subject.fy = null;
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
