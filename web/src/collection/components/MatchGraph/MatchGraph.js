import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import D3Graph from "./D3Graph";
import MatchType from "../FileMatchesPage/MatchType";
import FileType from "../FileBrowserPage/FileType";
import { useHistory } from "react-router-dom";
import { routes } from "../../../routing/routes";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2),
  },
  content: {
    width: "100%",
    minHeight: 500,
  },
  tooltip: {
    position: "absolute",
    textAlign: "center",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(2),
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
  },
}));

/**
 * Get collection of links compatible with D3Graph.
 */
function getLinks(source, matches) {
  return matches.map((match) => ({
    source: match.source,
    target: match.target,
    distance: match.distance,
  }));
}

/**
 * Get collection of nodes compatible with D3Graph
 */
function getNodes(source, files, matches) {
  const children = new Set();
  for (const match of matches) {
    if (match.source === source.id) {
      children.add(match.target);
    } else if (match.target === source.id) {
      children.add(match.source);
    }
  }
  const group = (file) => {
    if (file.id === source.id) {
      return 1;
    } else if (children.has(file.id)) {
      return 2;
    }
    return 3;
  };
  return [
    ...Object.values(files).map((file) => ({
      id: file.id,
      group: group(file),
      file: file,
    })),
  ];
}

function MatchGraph(props) {
  const { source, matches, files, className } = props;
  const classes = useStyles();
  const ref = useRef(null);
  const [graph, setGraph] = useState(null);

  const history = useHistory();

  const handleClickFile = useCallback(
    (node) => history.push(routes.collection.fileURL(node.file.id)),
    []
  );

  useEffect(() => {
    if (ref.current != null) {
      if (graph != null) {
        graph.cleanup();
      }
      const newGraph = new D3Graph({
        links: getLinks(source, matches),
        nodes: getNodes(source, files, matches),
        container: ref.current,
        classes: { content: classes.content, tooltip: classes.tooltip },
        onClick: handleClickFile,
      });
      newGraph.display();
      setGraph(newGraph);
    }
  }, [ref.current, source, matches]);

  return (
    <div className={clsx(classes.root, className)}>
      <svg ref={ref} />
    </div>
  );
}

MatchGraph.propTypes = {
  /**
   * A initial file for which all similar files were selected
   */
  source: FileType.isRequired,
  /**
   * Similarity relationship between files
   */
  matches: PropTypes.arrayOf(MatchType).isRequired,
  /**
   * Similar files map
   */
  files: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default MatchGraph;
