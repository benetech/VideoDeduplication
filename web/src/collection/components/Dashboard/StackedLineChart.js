import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";
import { Line } from "react-chartjs-2";
import { useTheme } from "@material-ui/core";
import Dashlet from "./Dashlet";

const useStyles = makeStyles((theme) => ({
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
  scales: { yAxes: [{ stacked: true }] },
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

const Actions = () => (
  <IconButton>
    <AddIcon />
  </IconButton>
);

function StackedLineChart(props) {
  const { title, labels, series, total: showTotal = false, className } = props;
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

StackedLineChart.propTypes = {
  title: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.number).isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  total: PropTypes.bool,
  className: PropTypes.string,
};

export default StackedLineChart;
