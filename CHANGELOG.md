# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2026-04-24

### Fixed
- Release workflow: pass `NPM_TOKEN` env so `.npmrc` token interpolation works.
- Bump CI/release Node version to 22 (Node 20 deprecated on GitHub runners).

## [0.1.1] - 2026-04-24

### Fixed
- Correct GitHub repository URL in `package.json` so the package shows up under the repo's "Packages" section.

## [0.1.0] - 2026-04-24

### Added
- Initial release.
- Framework-agnostic core (`createScrollDateIndicator`).
- React bindings (`useScrollDateIndicator`, `ScrollDateIndicator`).
- Locale-aware presets (`formatRelativeDay`, `formatMonthYear`, `matrixTimelinePreset`).
