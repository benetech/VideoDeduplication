import PropTypes from "prop-types";
import IconKind from "../../../collection/state/templates/IconKind";
import { pickRandom, randomId } from "./helpers";
import faker from "faker";

function standardIcon(key) {
  return {
    kind: IconKind.PREDEFINED,
    key: key,
  };
}

const nameIcons = [
  { name: "Police Car", icon: standardIcon("GiPoliceCar") },
  { name: "Police Officer", icon: standardIcon("GiPoliceOfficerHead") },
  { name: "Knife", icon: standardIcon("GiButterflyKnife") },
  { name: "Molotov Cocktail", icon: standardIcon("GiMolotov") },
  { name: "Explosion", icon: standardIcon("GiCornerExplosion") },
  { name: "Handgun", icon: standardIcon("GiPistolGun") },
  { name: "Bombing", icon: standardIcon("GiBombingRun") },
  { name: "Jet Fighter", icon: standardIcon("GiJetFighter") },
];

function randomExample({ templateId }) {
  return {
    id: randomId(),
    url: faker.image.imageUrl(),
    templateId: templateId || randomId(),
  };
}

function* randomExamples({ templateId, count = 5 }) {
  for (let i = 0; i < count; i++) {
    yield randomExample({ templateId });
  }
}

function randomIcon() {
  return pickRandom(nameIcons).icon;
}

export function randomTemplate() {
  const id = randomId();
  const { name, icon } = pickRandom(nameIcons);
  return {
    id: id,
    name: name,
    icon: icon,
    examples: [...randomExamples({ templateId: id })],
  };
}

export function* randomTemplates({ count }) {
  for (let i = 0; i < count; i++) {
    yield randomTemplate();
  }
}
