import TaskStatus from "../../../../../application/state/tasks/TaskStatus";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import PlayCircleFilledWhiteOutlinedIcon from "@material-ui/icons/PlayCircleFilledWhiteOutlined";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import BlockOutlinedIcon from "@material-ui/icons/BlockOutlined";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";

/**
 * Get background task status icon.
 */
export default function getStatusIcon(status) {
  switch (status) {
    case TaskStatus.PENDING:
      return ScheduleOutlinedIcon;
    case TaskStatus.RUNNING:
      return PlayCircleFilledWhiteOutlinedIcon;
    case TaskStatus.SUCCESS:
      return CheckOutlinedIcon;
    case TaskStatus.FAILURE:
      return CloseOutlinedIcon;
    case TaskStatus.CANCELLED:
      return BlockOutlinedIcon;
    default:
      console.warn(`Unsupported task status: ${status}`);
      return HelpOutlineOutlinedIcon;
  }
}
