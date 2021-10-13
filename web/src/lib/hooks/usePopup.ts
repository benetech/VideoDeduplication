import useUniqueId from "./useUniqueId";
import React, { useCallback, useRef, useState } from "react";

export type ClickTriggerOptions<TElement extends HTMLElement = HTMLElement> = {
  ref: React.RefObject<TElement>;
  "aria-controls": string;
  "aria-haspopup": boolean;
  "aria-expanded": boolean;
  onClick: () => void;
};

export type PopupOptions<TElement extends HTMLElement = HTMLElement> = {
  id: string;
  open: boolean;
  onClose: () => void;
  anchorEl: TElement | null;
};

export type PopupBindings<TElement extends HTMLElement = HTMLElement> = {
  clickTrigger: ClickTriggerOptions<TElement>;
  popup: PopupOptions<TElement>;
};

export default function usePopup<TElement extends HTMLElement = HTMLElement>(
  prefix = ""
): PopupBindings<TElement> {
  const ref = useRef<TElement>(null);
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
