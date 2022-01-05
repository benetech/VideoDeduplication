import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Checkbox,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
} from "@material-ui/core";
import { Contributor } from "../../../model/VideoFile";
import { useIntl } from "react-intl";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import ProgressAttr from "../../basic/ProgressAttr/ProgressAttr";

const useStyles = makeStyles<Theme>({
  contributorsTable: {},
});

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    partner: intl.formatMessage({ id: "partners.partner" }),
    total: intl.formatMessage({ id: "repos.attr.totalFingerprints.short" }),
    pulled: intl.formatMessage({ id: "repos.attr.pulledFingerprints.short" }),
    progress: intl.formatMessage({ id: "repos.attr.pullProgress.short" }),
  };
}

function handleSelected(
  contributor: Contributor,
  selected: Contributor["id"][],
  setSelected: (selected: Contributor["id"][]) => void
): () => void {
  return () => {
    if (selected.some((id) => id === contributor.id)) {
      setSelected(selected.filter((id) => id !== contributor.id));
    } else {
      setSelected([...selected, contributor.id]);
    }
  };
}

function handleSelectAll(
  contributors: Contributor[],
  selected: Contributor["id"][],
  setSelected: (selected: Contributor["id"][]) => void
): () => void {
  return () => {
    if (selected.length === 0) {
      setSelected(contributors.map((contributor) => contributor.id));
    } else {
      setSelected([]);
    }
  };
}

type ContributorsTableProps = {
  contributors: Contributor[];
  selected: Contributor["id"][];
  onSelectionChange: (selected: Contributor["id"][]) => void;
  className?: string;
};

function ContributorsTable(props: ContributorsTableProps): JSX.Element {
  const { contributors, selected, onSelectionChange, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  return (
    <TableContainer className={className}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={
                  selected.length > 0 && selected.length < contributors.length
                }
                checked={selected.length === contributors.length}
                onChange={handleSelectAll(
                  contributors,
                  selected,
                  onSelectionChange
                )}
              />
            </TableCell>
            <TableCell align="left">{messages.partner}</TableCell>
            <TableCell align="right">{messages.total}</TableCell>
            <TableCell align="right">{messages.pulled}</TableCell>
            <TableCell align="left">{messages.progress}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contributors.map((contributor) => (
            <TableRow key={contributor.id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.some((id) => id === contributor.id)}
                  onChange={handleSelected(
                    contributor,
                    selected,
                    onSelectionChange
                  )}
                />
              </TableCell>
              <TableCell align="left">{contributor.name}</TableCell>
              <TableCell align="right">
                {contributor.stats?.totalFingerprintsCount || 0}
              </TableCell>
              <TableCell align="right">
                {contributor.stats?.pulledFingerprintsCount || 0}
              </TableCell>
              <TableCell align="right">
                <ProgressAttr
                  value={
                    (100 * (contributor.stats?.pulledFingerprintsCount || 0)) /
                    (contributor.stats?.totalFingerprintsCount || 1)
                  }
                  variant="determinate"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ContributorsTable;
