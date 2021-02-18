import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "@material-ui/core";
import Dashlet from "./Dashlet";
import { useIntl } from "react-intl";

const useStyles = makeStyles(() => ({
  content: {
    minHeight: 300,
    minWidth: 300,
  },
}));

const data = (categories, theme) => ({
  datasets: [
    {
      label: "Categories",
      data: categories.map((category) => category.value),
      backgroundColor: categories.map((category) => category.color),
      borderWidth: 2,
      borderColor: theme.palette.white,
      hoverBorderColor: theme.palette.white,
    },
  ],
  labels: categories.map((category) => category.name),
});

const options = (theme) => ({
  legend: {
    display: true,
    position: "bottom",
  },
  responsive: true,
  maintainAspectRatio: false,
  cutoutPercentage: 60,
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

const sumCategories = (categories) =>
  categories.reduce((acc, cat) => acc + cat.value, 0);

const Actions = () => {
  const intl = useIntl();
  return (
    <IconButton
      aria-label={intl.formatMessage({ id: "actions.showMoreOptions" })}
    >
      <AddIcon />
    </IconButton>
  );
};

function PieChart(props) {
  const { title, total, categories, className } = props;
  const classes = useStyles();
  const theme = useTheme();

  const handleClick = useCallback(
    (elements) => {
      if (elements[0] == null) {
        return;
      }
      const { _index: index } = elements[0];
      const category = categories[index];
      if (category?.onClick != null) {
        category.onClick();
      }
    },
    [categories]
  );

  return (
    <Dashlet
      title={title}
      summary={total || sumCategories(categories)}
      actions={<Actions />}
      className={className}
    >
      <div className={classes.content}>
        <Doughnut
          data={data(categories, theme)}
          options={options(theme)}
          getElementAtEvent={handleClick}
        />
      </div>
    </Dashlet>
  );
}

PieChart.propTypes = {
  title: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ).isRequired,
  total: PropTypes.number,
  className: PropTypes.string,
};

export default PieChart;
