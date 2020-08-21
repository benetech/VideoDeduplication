import CarIcon from "@material-ui/icons/LocalTaxiOutlined";
import AirplaneIcon from "@material-ui/icons/AirplanemodeActiveOutlined";
import MusicIcon from "@material-ui/icons/MusicNoteOutlined";

/**
 * Array of well-known object kinds
 */
export const ObjectKindsList = [
  {
    id: "airplane",
    name: "object.type.airplane",
    icon: AirplaneIcon,
  },
  {
    id: "car",
    name: "object.type.car",
    icon: CarIcon,
  },
  {
    id: "music",
    name: "object.type.music",
    icon: MusicIcon,
  },
];

/**
 * Mapping (kind-id -> kind) for well known object kinds.
 */
export const ObjectKinds = {};

for (let kind of ObjectKindsList) {
  ObjectKinds[kind.id] = kind;
}

export default ObjectKinds;
