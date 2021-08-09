import React, { useCallback, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileListType from "../../../application/state/files/coll/FileListType";
import FileLinearList from "../../../components/files/FileLinearList";
import FileGridList from "../../../components/files/FileGridList";
import useFilesColl from "../../../application/api/files/useFilesColl";
import LazyLoad from "react-lazyload";
import useFilesQuery from "../../../application/api/files/useFilesQuery";
import { useShowFile } from "../../../routing/hooks";
import Zoom from "@material-ui/core/Zoom";
import Fab from "@material-ui/core/Fab";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import VisibilitySensor from "react-visibility-sensor";
import { scrollIntoView } from "../../../lib/helpers/scroll";
import { useResizeDetector } from "react-resize-detector";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    transform: "translate(0%, 0px)",
    padding: ({ listType }) =>
      listType === FileListType.grid ? theme.spacing(2) : 0,
  },
  data: {
    marginTop: theme.spacing(2),
  },
  top: {
    width: "100%",
    height: 1,
  },
  fab: {
    position: "sticky",
    bottom: theme.spacing(5),
    margin: theme.spacing(5),
    display: "flex",
    justifyContent: "flex-end",
  },
}));

function listComponent(view) {
  switch (view) {
    case FileListType.linear:
      return FileLinearList;
    case FileListType.grid:
      return FileGridList;
    default:
      throw new Error(`Unsupported fingerprints view type: ${view}`);
  }
}

function getPages(list, pageSize, offset = 0) {
  const pages = [];
  const totalCount = Math.max(list.length - offset);
  const pageCount = Math.ceil(totalCount / pageSize);
  for (let i = 0; i < pageCount; i++) {
    pages.push(list.slice(offset + pageSize * i, offset + pageSize * (i + 1)));
  }
  return pages;
}

function FilesCollection(props) {
  const { className, ...other } = props;
  const collection = useFilesColl();
  const query = useFilesQuery(collection.params);
  const List = listComponent(collection.listType);
  const classes = useStyles({ listType: collection.listType });
  const showFile = useShowFile();
  const files = query.files;

  // Scroll top feature
  const topRef = useRef(null);
  const [top, setTop] = useState(true);
  const scrollTop = useCallback(() =>
    scrollIntoView(topRef, { smooth: files.length < 100 })
  );

  // Split files into pages
  const pageSize = 24;
  const { height: pageHeight, ref: pageRef } = useResizeDetector();
  const eagerFiles = useMemo(() => files.slice(0, pageSize), [files]);
  const lazyPages = useMemo(() => getPages(files, pageSize, pageSize), [files]);

  return (
    <div className={clsx(className, classes.container)} {...other}>
      <VisibilitySensor onChange={setTop} partialVisibility>
        <div className={classes.top} ref={topRef} />
      </VisibilitySensor>
      <List className={classes.data} ref={pageRef}>
        {eagerFiles.map((file) => (
          <List.Item
            file={file}
            button
            key={file.id}
            blur={collection.blur}
            highlight={collection.params.query}
            onClick={showFile}
          />
        ))}
      </List>
      {pageHeight > 0 &&
        lazyPages.map((page, index) => (
          <LazyLoad key={index} height={pageHeight}>
            <List className={classes.data}>
              {page.map((file) => (
                <List.Item
                  file={file}
                  button
                  key={file.id}
                  blur={collection.blur}
                  highlight={collection.params.query}
                  onClick={showFile}
                />
              ))}
            </List>
          </LazyLoad>
        ))}
      <List className={classes.data}>
        <List.LoadTrigger
          error={query.error}
          loading={query.loading}
          onLoad={query.load}
          hasMore={query.hasMore}
        />
      </List>
      <div className={classes.fab}>
        <Zoom in={!top}>
          <Fab color="primary" onClick={scrollTop}>
            <ExpandLessIcon />
          </Fab>
        </Zoom>
      </div>
    </div>
  );
}

FilesCollection.propTypes = {
  className: PropTypes.string,
};

export default FilesCollection;
