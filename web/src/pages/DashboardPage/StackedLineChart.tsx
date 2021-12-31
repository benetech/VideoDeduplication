import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme, useTheme } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";
import { ChartData, Line } from "react-chartjs-2";
import Dashlet from "./Dashlet";
import { useIntl } from "react-intl";
import * as ChartJS from "chart.js";

const useStyles = makeStyles<Theme>(() => ({
  content: {
    minHeight: 300,
    minWidth: 300,
  },
}));

const data = (
  datasets: ChartDataSeries[],
  labels: string[]
): ChartData<ChartJS.ChartData> => ({
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

const options = (theme: Theme): ChartJS.ChartOptions => ({
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

function total(datasets: ChartDataSeries[]): number {
  return datasets.reduce((acc, series) => {
    return acc + series.data[series.data.length - 1];
  }, 0);
}

const Actions = (): JSX.Element => {
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

export type ChartDataSeries = {
  name: string;
  data: number[];
  color?: string;
};

export type ChartDataProps = {
  labels: string[];
  series: ChartDataSeries[];
};

type StackedLineChartProps = ChartDataProps & {
  title: string;
  className?: string;
};
export default StackedLineChart;
