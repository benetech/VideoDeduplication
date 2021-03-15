import IconKind from "../../../collection/state/templates/IconKind";
import { pickRandom, randomId } from "./helpers";
import faker from "faker";
import * as GameIcons from "react-icons/gi";

const icons = Object.keys(GameIcons);

function randomIcon() {
  return {
    kind: IconKind.PREDEFINED,
    key: pickRandom(icons),
  };
}

function randomName() {
  return (
    `${faker.commerce.productAdjective()} ` +
    `${faker.company.catchPhraseNoun()}`
  );
}

function randomExample({ templateId }) {
  return {
    id: randomId(),
    url: faker.image.image(),
    templateId: templateId || randomId(),
  };
}

function* randomExamples({ templateId, count = 5 }) {
  for (let i = 0; i < count; i++) {
    yield randomExample({ templateId });
  }
}

export function randomTemplate() {
  const id = randomId();
  return {
    id: id,
    name: randomName(),
    icon: randomIcon(),
    examples: [
      ...randomExamples({ templateId: id, count: 1 + Math.random() * 4 }),
    ],
  };
}

export function* randomTemplates({ count }) {
  for (let i = 0; i < count; i++) {
    yield randomTemplate();
  }
}
