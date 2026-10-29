# @purduehackers/phack-cli

Create and look up Purdue Hackers `phack.rs` short links.
Requires [Bun](https://bun.sh) and the Vercel CLI with access to the PH team.

```sh
bun add --global @purduehackers/phack-cli
vercel login
phack create https://purduehackers.com/events --slug events
phack get events
```

Omit `--slug` to generate one. Commands return JSON and never overwrite an existing destination.
After an uncertain create, read the same slug before retrying.
