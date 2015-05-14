#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var concat = require('concat-stream')
var normalize = require('geojson-normalize')
var flatten = require('geojson-flatten')
var turf = require('turf')

setTimeout(function() {
  ((argv._[0] && fs.createReadStream(argv._[0])) || process.stdin).pipe(concat(function(geo){
    var geo = geo.toString()
    geo = processGeo(geo)
    fs.readFile(__dirname+'/index.html', 'utf8', function(err, html){
      html = html.split('{{geojson}}').join(geo)
      console.log(html)
    })
  }))
}, 10);


function processGeo (geo) {
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
      for(var i = 0; i < feature.geometry.coordinates.length-2; i++){
        var segment = turf.linestring(
          [feature.geometry.coordinates[i],feature.geometry.coordinates[i+1]],
          feature.properties)
        broken.features.push(segment)
      }
    } else if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates.forEach(function(ring){
        for(var i = 0; i < ring.length-2; i++){
          var segment = turf.linestring(
            [ring[i], ring[i+1]],
            {stroke: '#0ff'})
          broken.features.push(segment)
        }
      })
      
      feature.properties['fill'] = '#0ff'
      feature.properties['stroke'] = '#0ff'
      feature.properties['fill-opacity'] = 0.1
      broken.features.push(feature)
    } else {
      throw new Error('Unimplemented Type: '+feature.type+' - '+feature.geometry.type)
    }
  })
//console.log(JSON.stringify(broken))
  return JSON.stringify(broken)
}