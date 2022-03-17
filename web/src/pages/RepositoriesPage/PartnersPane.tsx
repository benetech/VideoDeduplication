import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Theme, Tooltip } from "@material-ui/core";
import { useParams } from "react-router";
import { EntityPageURLParams } from "../../routing/routes";
import { useIntl } from "react-intl";
import PaneHeader from "../../components/basic/PaneHeader/PaneHeader";
import Title from "../../components/basic/Title";
import FlatPane from "../../components/basic/FlatPane/FlatPane";
import useContributorsAll from "../../application/api/repositories/useContributorsAll";
import { Contributor, DefaultFilters } from "../../model/VideoFile";
import ContributorsTable from "../../components/remote/ContributorsTable";
import Spacer from "../../components/basic/Spacer";
import SearchIcon from "@material-ui/icons/Search";
import useFilesColl from "../../application/api/files/useFilesColl";
import { useShowCollection } from "../../routing/hooks";

const useStyles = makeStyles<Theme>((theme) => ({
  partnersPane: {},
  action: {
    marginRight: theme.spacing(2),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    partners: intl.formatMessage({ id: "repos.attr.partners" }),
    showFingerprints: intl.formatMessage({ id: "actions.showFingerprints" }),
  };
}

type PartnersPaneProps = {
  className?: string;
};

function PartnersPane(props: PartnersPaneProps): JSX.Element | null {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { id } = useParams<EntityPageURLParams>();
  const { contributors } = useContributorsAll({ repositoryId: Number(id) });
  const [selected, setSelected] = useState<Contributor["id"][]>([]);
  const { setParams } = useFilesColl();
  const showColl = useShowCollection();

  const handleShowSigs = useCallback(() => {
    setParams({ ...DefaultFilters, remote: true, contributors: selected });
    showColl();
  }, [setParams, selected]);

  // Reset selection on repository change
  useEffect(() => setSelected([]), [id]);

  if (contributors.length === 0) {
    return null;
  }

  return (
    <FlatPane className={className} {...other}>
      <PaneHeader>
        <Title text={messages.partners} variant="subtitle" />
        <Spacer />
        {selected.length > 0 && (
          <Tooltip title={messages.showFingerprints}>
            <IconButton
              size="small"
              className={classes.action}
              onClick={handleShowSigs}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
        )}
      </PaneHeader>
      <ContributorsTable
        contributors={contributors}
        selected={selected}
        onSelectionChange={setSelected}
      />
    </FlatPane>
  );
}

export default PartnersPane;
