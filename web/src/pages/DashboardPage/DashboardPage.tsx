import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import AppPage from "../../components/app/AppPage";
import { useIntl } from "react-intl";
import Dashboard from "./Dashboard";

const useStyles = makeStyles<Theme>(() => ({
  body: {
    height: "100%",
  },
  dashboard: {
    height: "100%",
  },
}));

function DashboardPage(props: DashboardPageProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <AppPage
      title={intl.formatMessage({
        id: "nav.dashboard",
      })}
      className={className}
    >
      <div className={classes.body} role="main">
        <Dashboard />
      </div>
    </AppPage>
  );
}

type DashboardPageProps = {
  className?: string;
};
export default DashboardPage;
