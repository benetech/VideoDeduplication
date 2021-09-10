import React from "react";
import PropTypes from "prop-types";
import useHandleTaskEvents from "../application/api/tasks/useHandleTaskEvents";

function HandleSocketEvents() {
  // Handle socket events
  useHandleTaskEvents();

  // Render nothing
  return null;
}

HandleSocketEvents.propTypes = {
  className: PropTypes.string,
};

export default HandleSocketEvents;
