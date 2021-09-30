import React, { useCallback, useState } from "react";
import clsx from "clsx";
import lodash from "lodash";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import PresetList from "../../../components/presets/PresetList";
import LoadTrigger from "../../../components/basic/LoadingTrigger/LoadTrigger";
import { useIntl } from "react-intl";
import UpdatePresetDialog from "./UpdatePresetDialog";
import DeletePresetDialog from "./DeletePresetDialog";
import useFilesColl from "../../../application/api/files/useFilesColl";
import usePresetsLazy from "../../../application/api/presets/usePresetsLazy";
import usePresetsAPI from "../../../application/api/presets/usePresetsAPI";
import { DefaultFilters } from "../../../model/VideoFile";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
  trigger: {
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  presets: {
    margin: theme.spacing(1),
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    error: intl.formatMessage({
      id: "presets.loadError",
    }),
  };
}

function Presets(props: PresetsProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [preset, setPreset] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { updatePreset, deletePreset } = usePresetsAPI();
  const presetList = usePresetsLazy();
  const collection = useFilesColl();
  const handleApply = useCallback((preset) => {
    const filters = lodash.merge({}, DefaultFilters, preset.filters);
    console.log("Applying", {
      preset,
      filters,
    });
    collection.setParams(filters);
  }, []);
  const handleShowUpdate = useCallback((preset) => {
    setPreset(preset);
    setShowUpdate(true);
  }, []);
  const handleCloseUpdate = useCallback(() => setShowUpdate(false), []);
  const handleShowDelete = useCallback((preset) => {
    setPreset(preset);
    setShowDelete(true);
  }, []);
  const handleCloseDelete = useCallback(() => setShowDelete(false), []);
  return (
    <div className={clsx(classes.root, className)}>
      <PresetList>
        {presetList.pages.map((presets) =>
          presets.map((preset) => (
            <PresetList.Item
              key={preset.name}
              preset={preset}
              onClick={handleApply}
              onUpdate={handleShowUpdate}
              onDelete={handleShowDelete}
            />
          ))
        )}
        <LoadTrigger
          loading={presetList.isLoading}
          onLoad={presetList.fetchNextPage}
          hasMore={presetList.hasNextPage}
          errorMessage={messages.error}
          error={Boolean(presetList.error)}
          className={classes.trigger}
        />
      </PresetList>
      {preset && (
        <UpdatePresetDialog
          preset={preset}
          open={showUpdate}
          onClose={handleCloseUpdate}
          onUpdate={updatePreset}
        />
      )}
      {preset && (
        <DeletePresetDialog
          preset={preset}
          open={showDelete}
          onClose={handleCloseDelete}
          onDelete={deletePreset}
        />
      )}
    </div>
  );
}

type PresetsProps = {
  className?: string;
};
export default Presets;
