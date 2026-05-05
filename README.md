# @zumerbox/changelog

A simple tool for generating changelogs for your projects, on top of [auto-changelog](https://github.com/cookpete/auto-changelog).

## Installation

```bash
npm install @zumerbox/changelog --save-dev
```

## Usage

```bash
npx @zumerbox/changelog
```

Run after tagging a new version (typically as a `postbump` script). The tool will either insert a new section at the top of `CHANGELOG.md` or update the section for the current version if it already exists.

## Behavior

- **Past releases are never touched.** Only the section for the latest tag is regenerated. Anything you have above older releases stays byte-for-byte.
- **First run** (no `CHANGELOG.md` yet): generates the full file from git history.
- **Subsequent runs**: generates only the section for the latest tag (`git describe --tags --abbrev=0`) and either prepends it or replaces the existing entry for that version.
- **Noise commits are filtered**: commit subjects matching `^Bumped version`, `^Create LICENSE`, `^Update README`, `^Update LICENSE`, `^Update CHANGELOG` are excluded from the output.

Any extra arguments you pass are forwarded to `auto-changelog` as-is.

## Migration from 1.x

1.x regenerated the whole file on every run, which meant manual edits to past sections were lost and reformatting from new auto-changelog versions silently rewrote published entries. 2.0 makes past entries immutable: only the latest release section is touched. Custom edits to past sections are now safe.

## Credits

Powered by [auto-changelog](https://github.com/cookpete/auto-changelog).
