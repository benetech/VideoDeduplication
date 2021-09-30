import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme, useTheme } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";
import { Line } from "react-chartjs-2";
import Dashlet from "./Dashlet";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>(() => ({
  content: {
    minHeight: 300,
    minWidth: 300,
  },
}));

const data = (datasets, labels) => ({
  labels,
  datasets: datasets.map((series) => ({
    label: series.name,
    fill: true,
    backgroundColor: series.color,
    pointRadius: 0,
    borderColor: series.color,
    borderCapStyle: "butt",
    data: series.data,
  })),
});

const options = (theme) => ({
  legend: {
    display: true,
    position: "bottom",
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    yAxes: [
      {
        stacked: true,
      },
    ],
  },
  animation: {
    duration: 750,
  },
  layout: {
    padding: 0,
    width: "100%",
    height: "100%",
  },
  tooltips: {
    enabled: true,
    mode: "index",
    intersect: false,
    borderWidth: 1,
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.white,
    titleFontColor: theme.palette.text.primary,
    bodyFontColor: theme.palette.text.secondary,
    footerFontColor: theme.palette.text.secondary,
  },
});

function total(datasets) {
  return datasets.reduce((acc, series) => {
    return acc + series.data[series.data.length - 1];
  }, 0);
}

const Actions = () => {
  const intl = useIntl();
  return (
    <IconButton
      aria-label={intl.formatMessage({
        id: "actions.showMoreOptions",
      })}
    >
      <AddIcon />
    </IconButton>
  );
};

function StackedLineChart(props: StackedLineChartProps): JSX.Element {
  const { title, labels, series, className } = props;
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Dashlet
      title={title}
      summary={total(series)}
      actions={<Actions />}
      className={className}
    >
      <div className={classes.content}>
        <Line data={data(series, labels)} options={options(theme)} />
      </div>
    </Dashlet>
  );
}

type StackedLineChartProps = {
  title: string;
  labels: string[];
  series: {
    name: string;
    data: number[];
    color?: string;
  }[];
  className?: string;
};
export default StackedLineChart;
