import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppPage from "../../../application/components/AppPage";
import { useIntl } from "react-intl";
import { Route, Switch } from "react-router-dom";
import { routes } from "../../../routing/routes";
import ProcessingPage from "../ProcessingPage";
import TaskDetailsPage from "../TaskDetailsPage";

const useStyles = makeStyles(() => ({
  body: {
    height: "100%",
  },
}));

function ProcessingRootPage(props) {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <AppPage
      title={intl.formatMessage({ id: "nav.processing" })}
      className={className}
    >
      <div className={classes.body} role="main">
        <Switch>
          <Route exact path={routes.processing.home}>
            <ProcessingPage />
          </Route>
          <Route path={routes.processing.task}>
            <TaskDetailsPage />
          </Route>
        </Switch>
      </div>
    </AppPage>
  );
}

ProcessingRootPage.propTypes = {
  className: PropTypes.string,
};

export default ProcessingRootPage;
