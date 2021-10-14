import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import AppPage from "../../components/app/AppPage";
import { useIntl } from "react-intl";
import { Route, Switch } from "react-router-dom";
import { routes } from "../../routing/routes";
import ProcessingPage from "../ProcessingPage";
import TaskDetailsPage from "../TaskDetailsPage";

const useStyles = makeStyles<Theme>(() => ({
  body: {
    height: "100%",
  },
}));

function ProcessingRootPage(props: ProcessingRootPageProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <AppPage
      title={intl.formatMessage({
        id: "nav.processing",
      })}
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

type ProcessingRootPageProps = {
  className?: string;
};
export default ProcessingRootPage;
