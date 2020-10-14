import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import D3Graph from "./D3Graph";
import MatchType from "../FileMatchesPage/MatchType";
import FileType from "../FileBrowserPage/FileType";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    height: 500,
  },
}));

/**
 * Get collection of links compatible with D3Graph.
 */
function getLinks(source, matches) {
  return matches.map((match) => ({
    source: source.id,
    target: match.file.id,
    value: 10 * (1 - match.distance),
  }));
}

/**
 * Get collection of nodes compatible with D3Graph
 */
function getNodes(source, matches) {
  return [
    { id: source.id, group: 2 },
    ...matches.map((match) => ({ id: match.file.id, group: 1 })),
  ];
}

function MatchGraph(props) {
  const { source, matches, className } = props;
  const classes = useStyles();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current != null) {
      const graph = new D3Graph({
        links: getLinks(source, matches),
        nodes: getNodes(source, matches),
        container: ref.current,
        classes: { content: classes.content },
      });
      graph.display();
    }
  }, [ref.current, source, matches]);

  return (
    <div className={clsx(classes.root, className)}>
      <svg ref={ref} />
    </div>
  );
}

MatchGraph.propTypes = {
  source: FileType.isRequired,
  matches: PropTypes.arrayOf(MatchType).isRequired,
  className: PropTypes.string,
};

export default MatchGraph;
