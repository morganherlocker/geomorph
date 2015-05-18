#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var concat = require('concat-stream')
var normalize = require('geojson-normalize')
var flatten = require('geojson-flatten')
var turf = require('turf')

var maps = {
  'dark': 'mapbox.dark',
  'light': 'mapbox.light',
  'satellite': 'morganherlocker.m6gb8hef',
  'streets': 'mapbox.streets'
}

if(argv.h || argv.help){
  docs();
} else {
  ((argv._[0] && fs.createReadStream(argv._[0])) || process.stdin).pipe(concat(function(geo){
    var geo = geo.toString()

    if(argv.f) argv.fast = argv.f

    geo = processGeo(geo, argv.fast)
    fs.readFile(__dirname+'/index.html', 'utf8', function(err, html){
      html = html.split('{{geojson}}').join(geo)

      if(argv.s) argv.speed = argv.s
      if(argv.speed) html = html.split('{{speed}}').join(argv.speed)
      else html = html.split('{{speed}}').join(400)

      if(argv.m) argv.map = argv.m
      if(maps[argv.map]) argv.map = maps[argv.map]
      if(argv.map) html = html.split('{{map}}').join(argv.map)
      else html = html.split('{{map}}').join('morganherlocker.m63a6il4')

      console.log(html)
    })
  }))
}

function processGeo (geo, fast) {
  geo = JSON.parse(geo)
  geo = flatten(normalize(geo))

  var broken = turf.featurecollection([])
  geo.features.forEach(function(feature){
    if(feature.geometry.type === 'Point'){
      feature.properties['marker-size'] = 'small'
      feature.properties['marker-color'] = '#fff'
      broken.features.push(feature)
    } else if (feature.geometry.type === 'LineString') {
      feature.properties['stroke'] = '#f0f'
      if(fast) {
        broken.features.push(feature)
      } else {
        for(var i = 0; i < feature.geometry.coordinates.length-1; i++){
          var segment = turf.linestring(
            [feature.geometry.coordinates[i],feature.geometry.coordinates[i+1]],
            feature.properties)
          broken.features.push(segment)
        }
      }
    } else if (feature.geometry.type === 'Polygon') {
      if(!fast){
        feature.geometry.coordinates.forEach(function(ring){
          for(var i = 0; i < ring.length-2; i++){
            var segment = turf.linestring(
              [ring[i], ring[i+1]],
              {stroke: '#0ff'})
            broken.features.push(segment)
          }
        })
      }
      
      feature.properties['fill'] = '#0ff'
      feature.properties['stroke'] = '#0ff'
      feature.properties['fill-opacity'] = 0.1
      broken.features.push(feature)
    } else {
      throw new Error('Unimplemented Type: '+feature.type+' - '+feature.geometry.type)
    }
  })

  return JSON.stringify(broken)
}

function docs(){
  console.log('geomorph\n===\n')
  console.log('geomorph [file] | hcat\n')
  console.log('cat [file] | geomorph | hcat\n')
  console.log('-s --speed : number of miliseconds per frame\n')
  console.log('-m --map : custom map id; defaults: dark, light, streets, satellite\n')
  console.log('-f --fast : if flagged, polygons and strings will not be rendered piece by piece\n')
  console.log('-h --help : show docs\n')
}