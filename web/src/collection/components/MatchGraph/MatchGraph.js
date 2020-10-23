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
function getNodes(source, files) {
  return [
    ...Object.values(files).map((file) => ({
      id: file.id,
      group: file.id === source.id ? 2 : 1,
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
        nodes: getNodes(source, files),
        container: ref.current,
        classes: { content: classes.content },
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
