# geomorph

`geomorph` takes a GeoJSON FeatureCollection or Feature and animates it on a map. Use `geomorph` to visualize and debug geographic algorithms. The output is raw HTML, which can be piped to your browser using [hcat](https://github.com/kessler/node-hcat).

###install

```sh
npm install geomorph -g
```

###usage

```sh
cat algorithm.geojson | geomorph --speed 200 | hcat
```

###test

```sh
cat fixtures/buffer.geojson | node index.js | hcat
```