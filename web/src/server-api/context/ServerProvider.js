import React from "react";
import PropTypes from "prop-types";
import ServerContext from "./ServerContext";

const ServerProvider = (props) => {
  const { server, children } = props;
  return (
    <ServerContext.Provider value={server}>{children}</ServerContext.Provider>
  );
};

ServerProvider.propTypes = {
  server: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default ServerProvider;
