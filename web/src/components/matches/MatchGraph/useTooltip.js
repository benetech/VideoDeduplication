import { useCallback, useState } from "react";

/**
 * Manage state and callbacks required for interactive tooltip.
 */
export default function useTooltip() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [data, setData] = useState(null);

  const onMouseOver = useCallback((element, data, position) => {
    setAnchorEl(element);
    setPosition(position);
    setData(data);
    setShow(true);
  }, []);

  const onMouseOut = useCallback(() => {
    setShow(false);
    setAnchorEl(null);
    setData(null);
  }, []);

  return {
    data,
    show,
    anchorEl,
    position,
    onMouseOver,
    onMouseOut,
  };
}
