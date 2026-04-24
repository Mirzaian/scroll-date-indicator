# Contributing

Thanks for your interest in improving `@mirzaian/scroll-date-indicator`.

## Development setup

1. Install dependencies: `pnpm install`.
2. Run the test suite: `pnpm test`.
3. Start the interactive playground: `pnpm playground`.
4. Build the library: `pnpm build`.

## Conventions

- TypeScript strict mode, no `any`.
- Public API stays framework-agnostic. The React layer must remain optional.
- Add or update tests for every behavioral change.
- Public exports must be re-exported from the appropriate entry (`index.ts`,
  `react.ts`, or `presets.ts`).

## Submitting changes

1. Fork the repository and create a feature branch.
2. Run `pnpm test` and `pnpm typecheck` before opening a PR.
3. Update `CHANGELOG.md` under `Unreleased`.
4. Open a pull request with a clear description and rationale.

By contributing, you agree that your contributions are licensed under the
MIT License (see [LICENSE](./LICENSE)).
