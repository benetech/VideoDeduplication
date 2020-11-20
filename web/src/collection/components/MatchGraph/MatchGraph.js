import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import D3Graph from "./D3Graph";
import MatchType from "../../prop-types/MatchType";
import FileType from "../../prop-types/FileType";
import { useHistory } from "react-router-dom";
import { routes } from "../../../routing/routes";
import prepareGraph from "./prepareGraph";
import useTooltip from "./useTooltip";
import NodeTooltip from "./NodeTooltip";
import LinkTooltip from "./LinkTooltip";
import comparisonURL from "./helpers";

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
  popover: {
    position: "fixed",
    marginLeft: theme.spacing(3),
  },
}));

function MatchGraph(props) {
  const { source, matches, files, className } = props;
  const classes = useStyles();
  const ref = useRef(null);
  const [graph, setGraph] = useState(null);
  const nodeTooltip = useTooltip();
  const linkTooltip = useTooltip();
  const history = useHistory();

  const handleClickFile = useCallback(
    (node) => history.push(routes.collection.fileURL(node.file.id)),
    []
  );

  const handleClickMatch = useCallback(
    (link) => history.push(comparisonURL(source.id, link)),
    [source]
  );

  useEffect(() => {
    if (ref.current != null) {
      if (graph != null) {
        graph.cleanup();
      }
      const { nodes, links } = prepareGraph(source, matches, files);
      const newGraph = new D3Graph({
        links,
        nodes,
        container: ref.current,
        classes: { content: classes.content, tooltip: classes.tooltip },
        onClickNode: handleClickFile,
        onClickEdge: handleClickMatch,
        onMouseOverNode: nodeTooltip.onMouseOver,
        onMouseOutNode: nodeTooltip.onMouseOut,
        onMouseOverLink: linkTooltip.onMouseOver,
        onMouseOutLink: linkTooltip.onMouseOut,
        options: {
          highlightHover: true,
        },
      });
      newGraph.display();
      setGraph(newGraph);
    }
  }, [ref.current, source.id]);

  return (
    <div className={clsx(classes.root, className)}>
      <svg ref={ref} />
      {nodeTooltip.show && (
        <NodeTooltip
          file={nodeTooltip.data.file}
          className={classes.popover}
          style={{ ...nodeTooltip.position }}
        />
      )}
      {linkTooltip.show && (
        <LinkTooltip
          link={linkTooltip.data}
          className={classes.popover}
          style={{ ...linkTooltip.position }}
        />
      )}
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
