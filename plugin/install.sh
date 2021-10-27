#!/usr/bin/env bash
# Install the plugin into the local Insomnia installation

set -eu

INSOMNIA_PLUGINS_DIR="$HOME/Library/Application Support/Insomnia/plugins"

if [[ ! -d "$INSOMNIA_PLUGINS_DIR" ]]; then
  echo >&2 "Did not find the Insomnia plugins directory ('$INSOMNIA_PLUGINS_DIR'). Is Insomnia installed?"
  exit 1
fi

# The destination directory for our plugin to be installed.
PLUGIN_DST_DIR="$INSOMNIA_PLUGINS_DIR/insomnia-plugin-helloworld"


# The double "mkdir -p" looks strange, but this is an effective way to delete an old installation of the plugin, if one
# existed, then start with a new directory.
mkdir -p "$PLUGIN_DST_DIR"
rm -rf "$PLUGIN_DST_DIR"
mkdir -p "$PLUGIN_DST_DIR"

cp plugin.package.json "$PLUGIN_DST_DIR/package.json"
cp helloworld.js "$PLUGIN_DST_DIR"

echo "Installed to '$PLUGIN_DST_DIR'!"
