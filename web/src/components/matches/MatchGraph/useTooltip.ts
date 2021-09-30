import { useCallback, useState } from "react";
import { Position } from "./model";
import { MoveHandler, RemoveHandler } from "./tracking";

type UseTooltipResult<TData> = {
  data: TData | null;
  show: boolean;
  anchorEl: HTMLElement | SVGElement | null;
  position: Position;
  onMouseOver: MoveHandler<TData>;
  onMouseOut: RemoveHandler<TData>;
};

/**
 * Manage state and callbacks required for interactive tooltip.
 */
export default function useTooltip<TData>(): UseTooltipResult<TData> {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGElement | null>(
    null
  );
  const [show, setShow] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [data, setData] = useState<TData | null>(null);

  const onMouseOver = useCallback(
    (element: HTMLElement | SVGElement, data: TData, position: Position) => {
      setAnchorEl(element);
      setPosition(position);
      setData(data);
      setShow(true);
    },
    []
  );

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
