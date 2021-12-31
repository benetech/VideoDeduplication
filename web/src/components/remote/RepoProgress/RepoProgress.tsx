import React from "react";
import { useTheme } from "@material-ui/core";
import { Repository } from "../../../model/VideoFile";
import { ChartData, Doughnut } from "react-chartjs-2";
import * as ChartJS from "chart.js";
import { useIntl } from "react-intl";

type RepoProgressProps = {
  repository: Repository;
  className?: string;
};

/**
 * Prepare chart data.
 */
function useData(repository: Repository): ChartData<ChartJS.ChartData> {
  const theme = useTheme();
  const intl = useIntl();
  const pulled = repository.stats?.pulledFingerprintsCount || 0;
  const total = repository.stats?.totalFingerprintsCount || 1;
  return {
    datasets: [
      {
        data: [pulled, total - pulled],
        backgroundColor: [
          theme.palette.success.light,
          theme.palette.action.disabled,
        ],
        borderWidth: 2,
        borderColor: theme.palette.white,
        hoverBorderColor: theme.palette.white,
      },
    ],
    labels: [
      intl.formatMessage({ id: "repos.attr.pulledFingerprints.short" }),
      intl.formatMessage({ id: "repos.attr.remainingFingerprints.short" }),
    ],
  };
}

function RepoProgress(props: RepoProgressProps): JSX.Element {
  const { repository, className, ...other } = props;
  const data = useData(repository);

  return (
    <div className={className} {...other}>
      <Doughnut
        data={data}
        options={{
          legend: {
            display: true,
            position: "bottom",
          },
        }}
      />
    </div>
  );
}

export default RepoProgress;
