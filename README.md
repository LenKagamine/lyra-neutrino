# Lyra Neutrino

> Note: this repo is **deprecated**, and is left as a standalone proof of concept for Neutrino. [The original project](https://github.com/LenKagamine/lyra) can now be built with Neutrino, and future development will worked on there.

A port of my music player [Lyra](https://github.com/LenKagamine/lyra), written using [Neutrino](https://github.com/LenKagamine/neutrino).

This project acts as a proof of concept for Neutrino, and allows me to work on Neutrino using a real application. As I continue adding features to Neutrino, I can steadily bring this up to state of Lyra (Electron).

## Main Differences

Neutrino doesn't support any Node features (aside from `__dirname`, `fs.readFile` and `fs.writeFile`), so any npm module that relies on them can't be run in Neutrino. For Lyra, this consists of most of the YouTube integration. Instead, all of the YouTube logic is extracted into a companion server (located in `server/`).

Also, some native GUI elements are not implemented yet, namely context menues and file dialogs. So, this currently doesn't support any local playback or video saving.

## Features

- Playback
  - Volume control
  - Shuffle
  - Skip forward / back 10 seconds
  - Skip to previous / next song
- Playlists
  - Create and delete playlists
  - Play songs in a playlist
- YouTube
  - Search for YouTube videos
  - YouTube video playback
  - Autoplay
  - Shows related videos

## Development

To run locally, clone this repo along with [Neutrino](https://github.com/LenKagamine/neutrino). Place them in the same directory, then build Neutrino. Make sure to place the built executable inside `path/to/neutrino/lib`. If you use CMake, the provided config should already do it.

Then, run the following:

```
npm install
npm run dev
```

To build the (unpacked) production version,

```
npm run build
npm run pack
```

This project uses `neutrino-webpack` and `neutrino-builder` for builds. For more information, see the [Neutrino docs](https://github.com/LenKagamine/neutrino#cli).

## Issues

- Windows
  - The [webview](https://github.com/LenKagamine/webview) used by Neutrino can't navigate to local HTML files. So, running the unpacked production build won't work.
- MacOS
  - Webkit / Safari doesn't support the Opus audio format.
  - For some reason, Webkit thinks the audio streams are twice as long than they actually are.
  - Sometimes, audio doesn't start until the window regains focus.
