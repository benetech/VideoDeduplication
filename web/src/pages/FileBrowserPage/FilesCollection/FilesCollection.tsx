import React, { useCallback, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ListType from "../../../model/ListType";
import useFilesColl from "../../../application/api/files/useFilesColl";
import LazyLoad from "react-lazyload";
import useFilesLazy from "../../../application/api/files/useFilesLazy";
import { useShowFile } from "../../../routing/hooks";
import Zoom from "@material-ui/core/Zoom";
import Fab from "@material-ui/core/Fab";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import VisibilitySensor from "react-visibility-sensor";
import { scrollIntoView } from "../../../lib/helpers/scroll";
import { useResizeDetector } from "react-resize-detector";
import { resolveFileListView } from "../../../components/files/FileList";

type FilesCollectionStyleProps = {
  listType: ListType;
};

const useStyles = makeStyles<Theme, FilesCollectionStyleProps>((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    transform: "translate(0%, 0px)",
    padding: ({ listType }) =>
      listType === ListType.grid ? theme.spacing(2) : 0,
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

function FilesCollection(props: FilesCollectionProps): JSX.Element {
  const { className, ...other } = props;
  const collection = useFilesColl();
  const query = useFilesLazy(collection.params);
  const ListView = resolveFileListView(collection.listType);
  const classes = useStyles({
    listType: collection.listType,
  });
  const showFile = useShowFile();
  const pages = query.pages; // Scroll top feature

  const topRef = useRef(null);
  const [top, setTop] = useState(true);
  const scrollTop = useCallback(
    () =>
      scrollIntoView(topRef, {
        smooth: pages.length < 2,
      }),
    []
  );

  // Select eager and lazy pages
  const { height: pageHeight, ref: pageRef } =
    useResizeDetector<HTMLDivElement>({
      handleWidth: false,
      skipOnMount: true,
    });
  const eagerFiles = useMemo(() => pages[0] || [], [pages]);
  const lazyPages = useMemo(() => pages.slice(1), [pages]);
  return (
    <div className={clsx(className, classes.container)} {...other}>
      <VisibilitySensor onChange={setTop} partialVisibility>
        <div className={classes.top} ref={topRef} />
      </VisibilitySensor>
      <ListView.List className={classes.data} ref={pageRef}>
        {eagerFiles.map((file) => (
          <ListView.Item
            file={file}
            button
            key={file.id}
            blur={collection.blur}
            highlight={collection.params.query}
            onClick={showFile}
          />
        ))}
      </ListView.List>
      {pageHeight != null &&
        pageHeight > 0 &&
        lazyPages.map((page, index) => (
          <LazyLoad key={index} height={pageHeight}>
            <ListView.List className={classes.data}>
              {page.map((file) => (
                <ListView.Item
                  file={file}
                  button
                  key={file.id}
                  blur={collection.blur}
                  highlight={collection.params.query}
                  onClick={showFile}
                />
              ))}
            </ListView.List>
          </LazyLoad>
        ))}
      <ListView.List className={classes.data}>
        <ListView.LoadTrigger
          error={query.isError}
          loading={query.isLoading}
          onLoad={query.fetchNextPage}
          hasMore={query.hasNextPage}
        />
      </ListView.List>
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

type FilesCollectionProps = {
  className?: string;
};
export default FilesCollection;
