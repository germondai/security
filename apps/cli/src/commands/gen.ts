import { defineCommand } from 'citty';
import { passwordLeaf } from './password.js';
import { uuidLeaf } from './uuid.js';
import { passphraseLeaf } from './passphrase.js';
import { secretLeaf } from './secret.js';
import { diceLeaf } from './dice.js';
import { colorLeaf } from './color.js';
import { networkLeaf } from './network.js';
import { cipherTextLeaf } from './cipherText.js';

export const gen = defineCommand({
  meta: { name: 'gen', description: 'Generators.' },
  subCommands: {
    password:    passwordLeaf,
    uuid:        uuidLeaf,
    passphrase:  passphraseLeaf,
    secret:      secretLeaf,
    dice:        diceLeaf,
    color:       colorLeaf,
    network:     networkLeaf,
    'cipher-text': cipherTextLeaf,
  },
});
