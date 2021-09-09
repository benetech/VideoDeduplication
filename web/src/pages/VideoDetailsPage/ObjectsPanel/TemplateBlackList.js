import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileType from "../../../prop-types/FileType";
import Loading from "../../../components/basic/Loading";
import { useIntl } from "react-intl";
import Button from "../../../components/basic/Button";
import { ListItemText, Menu, MenuItem, Tooltip } from "@material-ui/core";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import usePopup from "../../../lib/hooks/usePopup";
import TemplateIcon from "../../../components/templates/TemplateIcon/TemplateIcon";
import ExcludedTemplate from "./ExcludedTemplate";
import useLoadAllTemplates from "../../../application/api/templates/useLoadAllTemplates";
import useExclusionsLazy from "../../../application/api/file-exclusions/useExclusionsLazy";
import useExclusionAPI from "../../../application/api/file-exclusions/useExclusionAPI";

const useStyles = makeStyles((theme) => ({
  blackList: {
    display: "flex",
    flexDirection: "column",
  },
  loading: {
    width: "100%",
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    display: "flex",
    marginBottom: theme.spacing(2),
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  templateIcon: {
    width: 25,
    height: 25,
    fontSize: 25,
    marginRight: theme.spacing(2),
  },
  exclusion: {
    marginBottom: theme.spacing(2),
  },
}));

/**
 * Get translated text
 */
function useMessages() {
  const intl = useIntl();
  return {
    loadError: intl.formatMessage({ id: "exclusion.load.error" }),
    exclude: intl.formatMessage({ id: "exclusion.addTemplateExclusion" }),
    excludeTooltip: intl.formatMessage({
      id: "exclusion.addTemplateExclusion.description",
    }),
  };
}

function TemplateBlackList(props) {
  const { file, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { createExclusion, deleteExclusion } = useExclusionAPI();
  const { clickTrigger, popup } = usePopup("exclude-templates");

  // Load templates
  const { templates } = useLoadAllTemplates();

  // Load exclusions
  const exclusionList = useExclusionsLazy({ fileId: file.id });

  // Check if more exclusions could be added
  const canExclude = exclusionList.total < templates.length;

  // Index excluded template ids
  const excluded = useMemo(() => {
    const result = new Set();
    exclusionList.pages.forEach((exclusions) =>
      exclusions.forEach((exclusion) => result.add(exclusion.template.id))
    );
    return result;
  }, [exclusionList.pages]);

  const exclude = useCallback(
    async (template) => {
      try {
        popup.onClose();
        await createExclusion({ template, file });
      } catch (error) {
        console.error("Error creating file exclusion.", error, { error });
      }
    },
    [file]
  );

  const dismiss = useCallback(async (exclusion) => {
    try {
      await deleteExclusion(exclusion);
    } catch (error) {
      console.error("Error deleting exclusion", error, { exclusion, error });
    }
  });

  return (
    <div className={clsx(classes.blackList, className)} {...other}>
      <div className={classes.header}>
        <Tooltip title={messages.excludeTooltip}>
          <div>
            <Button
              color="primary"
              variant="contained"
              disabled={!canExclude}
              {...clickTrigger}
            >
              <VisibilityOffIcon className={classes.icon} />
              {messages.exclude}
            </Button>
          </div>
        </Tooltip>
        <Menu {...popup}>
          {templates
            .filter((template) => !excluded.has(template.id))
            .map((template) => (
              <MenuItem onClick={() => exclude(template)} key={template.id}>
                <TemplateIcon icon={template.icon} className={classes.icon} />
                <ListItemText primary={template.name} />
              </MenuItem>
            ))}
        </Menu>
      </div>
      {exclusionList.pages.map((exclusions) =>
        exclusions.map((exclusion) => (
          <ExcludedTemplate
            exclusion={exclusion}
            onDelete={dismiss}
            key={exclusion.id}
            className={classes.exclusion}
          />
        ))
      )}
      {exclusionList.hasNextPage && (
        <div className={classes.loading}>
          <Loading
            onRetry={exclusionList.fetchNextPage}
            errorMessage={messages.loadError}
            error={exclusionList.error}
          />
        </div>
      )}
    </div>
  );
}

TemplateBlackList.propTypes = {
  /**
   * File for which to display black-listed templates.
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default TemplateBlackList;
