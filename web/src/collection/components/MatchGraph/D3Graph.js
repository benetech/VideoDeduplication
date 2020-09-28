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
  constructor({
    links,
    nodes,
    container,
    width = 500,
    height = 500,
    classes = {},
  }) {
    this.links = links.map(Object.create);
    this.nodes = nodes.map(Object.create);
    this.width = width;
    this.height = height;
    this.container = container;
    this.classes = classes;
  }

  /**
   * Display graph.
   */
  display() {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    const color = (d) => scale(d.group);

    const simulation = this._createForceSimulation();

    removeChildren(this.container);

    let svg = d3
      .select(this.container)
      .attr("preserveAspectRatio", "xMaxYMid meet")
      .attr("viewBox", [0, 0, this.width, this.height])
      .classed(this.classes.content, true);

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(this.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(this.nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", color)
      .call(this._createDrag(simulation));

    node.append("title").text((d) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });
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
        d3.forceLink(this.links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));
  }
}
