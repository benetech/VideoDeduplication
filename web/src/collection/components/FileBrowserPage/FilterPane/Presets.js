import React, { useCallback } from "react";
import clsx from "clsx";
import lodash from "lodash";
import PropTypes from "prop-types";
import initialState from "../../../state/fileList/initialState";
import { makeStyles } from "@material-ui/styles";
import PresetList from "./PresetList";
import { useDispatch } from "react-redux";
import { updateFilters } from "../../../state/fileList/actions";
import LoadTrigger from "../../../../common/components/LoadingTrigger/LoadTrigger";
import { useIntl } from "react-intl";
import PresetAPI from "./PresetAPI";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
  trigger: {
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    error: intl.formatMessage({ id: "presets.loadError" }),
  };
}

function Presets(props) {
  const { className } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const messages = useMessages();
  const presetApi = PresetAPI.use();
  const presetList = presetApi.useLazyPresetList();

  const handleApply = useCallback((preset) => {
    const filters = lodash.merge({}, initialState.filters, preset.filters);
    dispatch(updateFilters(filters));
  });

  const handleDelete = useCallback(
    async (preset) => {
      await presetApi.deletePreset(preset);
    },
    [presetApi]
  );

  return (
    <div className={clsx(classes.root, className)}>
      <PresetList>
        {presetList.presets.map((preset, index) => (
          <PresetList.Item
            key={preset.id}
            preset={preset}
            onClick={handleApply}
            onDelete={handleDelete}
            divider={index < presetList.presets.length - 1}
          />
        ))}
        <LoadTrigger
          loading={presetList.isLoading}
          onLoad={presetList.loadMore}
          hasMore={presetList.hasMore}
          errorMessage={messages.error}
          error={presetList.error}
          className={classes.trigger}
        />
      </PresetList>
    </div>
  );
}

Presets.propTypes = {
  className: PropTypes.string,
};

export default Presets;
