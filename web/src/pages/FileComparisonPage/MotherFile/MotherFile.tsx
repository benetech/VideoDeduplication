import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import useFile from "../../../application/api/files/useFile";
import LoadingHeader from "../LoadingHeader";
import FileDetails from "../FileDetails";
import FileDetailsHeader from "./FileDetailsHeader";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {},
  header: {
    height: theme.spacing(10),
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  title: { ...theme.mixins.title3, fontWeight: "bold", flexGrow: 1 },
  loading: {
    margin: theme.spacing(2),
  },
  fileHeader: {
    marginTop: 0,
    margin: theme.spacing(2),
  },
  backButton: {
    marginRight: theme.spacing(2),
  },
}));
/**
 * Get i18n text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({
      id: "file.mother",
    }),
    loadError: intl.formatMessage({
      id: "file.load.error.single",
    }),
  };
}

function MotherFile(props: MotherFileProps): JSX.Element {
  const { motherFileId, onBack, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { file, isError, refetch } = useFile(motherFileId);
  let content;

  if (file == null) {
    content = (
      <LoadingHeader
        onRetry={refetch}
        errorMessage={messages.loadError}
        error={isError}
        className={classes.loading}
      />
    );
  } else {
    content = (
      <div>
        <FileDetailsHeader
          file={file}
          className={classes.fileHeader}
          data-selector="MotherFileHeader"
        />
        <FileDetails file={file} />
      </div>
    );
  }

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        {onBack != null && (
          <IconButton className={classes.backButton} onClick={onBack}>
            <ArrowBackOutlinedIcon />
          </IconButton>
        )}
        <div className={classes.title}>{messages.title}</div>
      </div>
      {content}
    </div>
  );
}

type MotherFileProps = {
  /**
   * Mother file id.
   */
  motherFileId: number;

  /**
   * Handle go-back button.
   */
  onBack?: () => void;
  className?: string;
};
export default MotherFile;
