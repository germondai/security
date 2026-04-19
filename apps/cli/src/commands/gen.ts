import { defineCommand } from "citty";
import { cipherTextLeaf } from "./cipherText.js";
import { colorLeaf } from "./color.js";
import { diceLeaf } from "./dice.js";
import { networkLeaf } from "./network.js";
import { passphraseLeaf } from "./passphrase.js";
import { passwordLeaf } from "./password.js";
import { secretLeaf } from "./secret.js";
import { uuidLeaf } from "./uuid.js";

export const gen = defineCommand({
  meta: { name: "gen", description: "Generators." },
  subCommands: {
    password: passwordLeaf,
    uuid: uuidLeaf,
    passphrase: passphraseLeaf,
    secret: secretLeaf,
    dice: diceLeaf,
    color: colorLeaf,
    network: networkLeaf,
    "cipher-text": cipherTextLeaf,
  },
});
