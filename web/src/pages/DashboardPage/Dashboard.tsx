import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme, useTheme } from "@material-ui/core"; // import BackdropMenu from "./BackdropMenu";
import { useIntl } from "react-intl"; // import DropDownButton from "../../../common/components/DropDownButton";
import PieChart from "./PieChart";
import StackedLineChart, { ChartDataProps } from "./StackedLineChart";
import Grid from "@material-ui/core/Grid";
import { MatchCategory } from "../../model/VideoFile";
import useMatchStats from "../../application/api/stats/useMatchStats";
import useFilesColl from "../../application/api/files/useFilesColl";
import { useShowCollection } from "../../routing/hooks"; // import useUniqueId from "../../../common/hooks/useUniqueId";

const useStyles = makeStyles<Theme>((theme) => ({
  dashboardContainer: {
    paddingTop: theme.dimensions.content.padding * 2,
    padding: theme.dimensions.content.padding,
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  blur: {
    filter: "blur(10px)",
  },
  body: {
    minHeight: "min-content",
    transform: "translate(0%, 0px)",
  },
  content: {
    height: "100%",
    paddingTop: theme.spacing(8),
    padding: theme.spacing(1),
  },
  buttonsPanel: {
    flexGrow: 1,
  },
})); // function useMessages() {
//   const intl = useIntl();
//   return {
//     dashboard: intl.formatMessage({ id: "collection.dashboard.title" }),
//   };
// }
// This data will be retrieved from server.

const dbMatches = (theme: Theme): ChartDataProps => ({
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  series: [
    {
      name: "Upcoming",
      data: [25, 27, 21, 21, 22, 30, 20, 21, 40],
      color: theme.palette.primary.light,
    },
    {
      name: "Possibly Related",
      data: [5, 10, 27, 40, 55, 60, 43, 21, 25],
      color: theme.palette.primary.main,
    },
    {
      name: "Completed",
      data: [5, 10, 12, 15, 25, 43, 80, 120, 100],
      color: "#131726",
    },
  ],
}); // function menuActions(intl) {
//   return [
//     {
//       title: intl.formatMessage({ id: "collection.analytics.matches" }),
//       handler: console.log,
//     },
//     {
//       title: intl.formatMessage({ id: "collection.analytics.mediaClass" }),
//       handler: console.log,
//     },
//     {
//       title: intl.formatMessage({ id: "collection.analytics.dbMatches" }),
//       handler: console.log,
//     },
//     {
//       title: intl.formatMessage({ id: "collection.analytics.advancedSearch" }),
//       handler: console.log,
//     },
//     {
//       title: intl.formatMessage({ id: "collection.analytics.collab" }),
//       handler: console.log,
//     },
//   ];
// }
// TODO: Uncomment code when backdrop menu is back again

function usePieChartStats() {
  const stats = useMatchStats();
  const theme = useTheme();
  const { updateParams } = useFilesColl();
  const showCollection = useShowCollection();
  const showDuplicates = useCallback(() => {
    updateParams({
      matches: MatchCategory.duplicates,
    });
    showCollection();
  }, []);
  const showRelated = useCallback(() => {
    updateParams({
      matches: MatchCategory.related,
    });
    showCollection();
  }, []);
  const showUnique = useCallback(() => {
    updateParams({
      matches: MatchCategory.unique,
    });
    showCollection();
  }, []);
  return {
    dataset: [
      {
        name: "Duplicates",
        value: stats.duplicates,
        color: theme.palette.primary.main,
        onClick: showDuplicates,
      },
      {
        name: "Possibly related",
        value: stats.related - stats.duplicates,
        color: theme.palette.primary.light,
        onClick: showRelated,
      },
      {
        name: "Unique files",
        value: stats.unique,
        color: "#131726",
        onClick: showUnique,
      },
    ],
    stats,
    total: stats.related,
  };
}

function Dashboard(props: DashboardProps): JSX.Element {
  const { className } = props;
  const classes = useStyles(); // const messages = useMessages();

  const theme = useTheme();
  const intl = useIntl(); // const [showMenu, setShowMenu] = useState(false);

  const showMenu = false; // const backdropMenuId = useUniqueId("backdrop-menu");

  const pieChartStats = usePieChartStats();
  return (
    <div className={clsx(classes.dashboardContainer, className)}>
      <div className={classes.header}>
        {/*<DropDownButton*/}
        {/*  title={messages.dashboard}*/}
        {/*  onClick={() => setShowMenu(!showMenu)}*/}
        {/*  aria-haspopup="true"*/}
        {/*  aria-controls={backdropMenuId}*/}
        {/*/>*/}
      </div>
      <div className={classes.body}>
        <div
          className={clsx(classes.content, {
            [classes.blur]: showMenu,
          })}
        >
          <Grid
            container
            spacing={3}
            role="region"
            aria-label={intl.formatMessage({
              id: "aria.label.dashboard",
            })}
          >
            <Grid item lg={6} xs={12}>
              <PieChart
                title="My Matches"
                categories={pieChartStats.dataset}
                total={pieChartStats.total}
              />
            </Grid>
            <Grid item lg={6} xs={12}>
              <StackedLineChart
                title="Database Matches"
                {...dbMatches(theme)}
              />
            </Grid>
          </Grid>
        </div>
        {/*<BackdropMenu*/}
        {/*  id={backdropMenuId}*/}
        {/*  actions={menuActions(intl)}*/}
        {/*  open={showMenu}*/}
        {/*  onClose={() => setShowMenu(false)}*/}
        {/*/>*/}
      </div>
    </div>
  );
}

type DashboardProps = {
  className?: string;
};
export default Dashboard;
