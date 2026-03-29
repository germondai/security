#!/usr/bin/env node
import('../dist/main.js').then((m) => m.run()).catch((e) => {
  console.error(e);
  process.exit(1);
});
