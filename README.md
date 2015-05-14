# geomorph

`geomorph` takes line delimitted geojson featurecollections and animates them on a map. 

###install

```sh
npm install geomorph -g
```

###usage

```sh
cat algorithm.geojson | geomorph | hcat
```

###test

```sh
cat fixtures/buffer.geojson | node index.js | hcat
```