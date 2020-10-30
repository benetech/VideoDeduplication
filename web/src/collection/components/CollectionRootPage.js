import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppPage from "../../application/components/AppPage";
import { useIntl } from "react-intl";
import { Redirect, Route, Switch } from "react-router-dom";
import { routes } from "../../routing/routes";
import FileBrowserPage from "./FileBrowserPage/FileBrowserPage";
import VideoDetailsPage from "./VideoDetailsPage/VideoDetailsPage";
import FileMatchesPage from "./FileMatchesPage/FileMatchesPage";
import FileClusterPage from "./FileClusterPage";
import FileComparisonPage from "./FileComparisonPage";

const useStyles = makeStyles(() => ({
  body: {
    height: "100%",
  },
  dashboard: {
    height: "100%",
  },
}));

function CollectionRootPage(props) {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <AppPage
      title={intl.formatMessage({ id: "collection.title" })}
      className={className}
    >
      <div className={classes.body} role="main">
        <Switch>
          <Route exact path={routes.collection.home}>
            <Redirect to={routes.collection.fingerprints} />
          </Route>
          <Route exact path={routes.collection.fingerprints}>
            <FileBrowserPage />
          </Route>
          <Route exact path={routes.collection.file}>
            <VideoDetailsPage />
          </Route>
          <Route exact path={routes.collection.fileMatches}>
            <FileMatchesPage />
          </Route>
          <Route exact path={routes.collection.fileCluster}>
            <FileClusterPage />
          </Route>
          <Route exact path={routes.collection.fileComparison}>
            <FileComparisonPage />
          </Route>
        </Switch>
      </div>
    </AppPage>
  );
}

CollectionRootPage.propTypes = {
  className: PropTypes.string,
};

export default CollectionRootPage;
