import useUniqueId from "./useUniqueId";
import { useCallback, useRef, useState } from "react";

export default function usePopup(prefix = "") {
  const ref = useRef(null);
  const id = useUniqueId(prefix);
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(() => setOpen(!open), [open]);
  const handleClose = useCallback(() => setOpen(false), []);

  return {
    clickTrigger: {
      ref,
      "aria-controls": id,
      "aria-haspopup": true,
      "aria-expanded": open,
      onClick: handleClick,
    },
    popup: {
      id,
      open,
      onClose: handleClose,
      anchorEl: ref.current,
    },
  };
}
