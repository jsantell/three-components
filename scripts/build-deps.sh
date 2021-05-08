#!/bin/sh

cd $(dirname $(readlink -f $0))/..
root=$PWD
nodemodules="$PWD/node_modules"
webmodules="$PWD/examples/web_modules"

rm -rf "$webmodules"

mkdir -p "$webmodules/three/build"
cp -r "$nodemodules/three/build/three.module.js" "$webmodules/three/build"
mkdir -p "$webmodules/three/examples/jsm/controls"
cp -r "$nodemodules/three/examples/jsm/controls/OrbitControls.js" "$webmodules/three/examples/jsm/controls"
mkdir -p "$webmodules/three/examples/jsm/loaders"
cp -r "$nodemodules/three/examples/jsm/loaders/RGBELoader.js" "$webmodules/three/examples/jsm/loaders"

cp -r "$nodemodules/dat.gui/build/dat.gui.module.js" "$webmodules/dat.gui.js"