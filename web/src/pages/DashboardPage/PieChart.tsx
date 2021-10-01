import React, { useCallback } from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme, useTheme } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";
import { Doughnut } from "react-chartjs-2";
import Dashlet from "./Dashlet";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>(() => ({
  content: {
    minHeight: 300,
    minWidth: 300,
  },
}));

const data = (categories: ChartDataCategory[], theme: Theme) => ({
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

const options = (theme: Theme) => ({
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

const sumCategories = (categories: ChartDataCategory[]): number =>
  categories.reduce((acc, cat) => acc + cat.value, 0);

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

function PieChart(props: PieChartProps): JSX.Element {
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

type ChartDataCategory = {
  name: string;
  value: number;
  color: string;
  onClick?: () => void;
};

type PieChartProps = {
  title: string;
  categories: ChartDataCategory[];
  total?: number;
  className?: string;
};
export default PieChart;
