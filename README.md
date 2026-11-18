# renCal Board view

A board view for [renCal](https://rencal.org) with columns for yesterday, today, tomorrow and the rest of the week.

![Board view in renCal](preview.png)

## Installation

Add the repository to `~/.config/rencal/plugins.toml`:

```toml
plugins = ["d5v7/rencal-view-board"]
```

## Development

The view is built with [`@rencomputer/rencal-sdk`](https://www.npmjs.com/package/@rencomputer/rencal-sdk), which provides the plugin API's types and the build: `rencal-sdk build` bundles `src/index.tsx` to the paths in `rencal-plugin.toml`.

```sh
pnpm install
pnpm dev     # rebuild dist/ on every change
```

Declare the checkout in `plugins.toml` to load it into renCal; edits reload while renCal is running:

```toml
plugins = ["~/dev/ren/rencal-view-board"]
```

`dist/` is not committed. renCal installs the built files from the latest GitHub release.

## Releasing

Push a version tag:

```sh
git tag v0.1.0
git push origin v0.1.0
```

The [release workflow](.github/workflows/release.yml) builds the view and publishes a release with `dist/board.js` and `dist/board.css` attached for every `v*` tag. renCal installs the latest release and shows its tag as the version.

## Board details

Event titles wrap to use the available column width. Locations and recognized video
meeting links are shown on the card; select the meeting icon and time to open it in the
system browser. Links are detected in the event URL, location, and description.
The current renCal SDK does not expose tasks or separately stored conference data,
so those cannot yet be shown or distinguished by this view.
