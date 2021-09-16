import useUniqueId from "./useUniqueId";
import React, { useCallback, useRef, useState } from "react";

export type ClickTriggerOptions = {
  ref: React.RefObject<HTMLElement>;
  "aria-controls": string;
  "aria-haspopup": boolean;
  "aria-expanded": boolean;
  onClick: () => void;
};

export type PopupOptions = {
  id: string;
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
};

export type PopupBindings = {
  clickTrigger: ClickTriggerOptions;
  popup: PopupOptions;
};

export default function usePopup(prefix: string = ""): PopupBindings {
  const ref = useRef<HTMLElement>(null);
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
