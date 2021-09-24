import React, { useEffect, useState, useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import D3Graph from "./D3Graph";
import MatchType from "../../../prop-types/MatchType";
import FileType from "../../../prop-types/FileType";
import prepareGraph from "./prepareGraph";
import useTooltip from "./useTooltip";
import NodeTooltip from "./NodeTooltip";
import LinkTooltip from "./LinkTooltip";
import linkComparison from "./helpers/linkComparison";
import { useCompareFiles, useShowFile } from "../../../routing/hooks";

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
  const [graphParent, setGraphParent] = useState(null);
  const nodeTooltip = useTooltip();
  const linkTooltip = useTooltip();
  const compareFiles = useCompareFiles();

  const showFile = useShowFile();
  const handleClickFile = useCallback((node) => showFile(node.file), []);

  const handleClickMatch = useCallback(
    (link) => compareFiles(...linkComparison(source.id, link)),
    [source.id]
  );

  useEffect(() => {
    if (graphParent != null) {
      const { nodes, links } = prepareGraph(source, matches, files);
      const graph = new D3Graph({
        links,
        nodes,
        container: graphParent,
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
      graph.display();
      return () => {
        graph.cleanup();
      };
    }
  }, [graphParent, source.id]);

  return (
    <div className={clsx(classes.root, className)}>
      <svg ref={setGraphParent} className={classes.content} />
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
