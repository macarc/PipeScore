# Contributing

Thanks for considering contributing to PipeScore!

Before creating a PR, make sure your code passes:

- `npx tsc` -- type check
- `npm run lint` -- formatting & lint
    note that you can generally ignore most eslint
    warnings (there's a lot of false positives).
    Don't ignore warnings from biome.
- `npm run test` -- tests should all pass

Apart from that, there's not much to say. Read the README in `src/PipeScore` for a basic overview of the structure if you want.

If you have any questions, feel free to create an issue.
