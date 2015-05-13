#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var concat = require('concat-stream');

((argv._[0] && fs.createReadStream(argv._[0])) || process.stdin).pipe(concat(function(geo){
  geo = geo.toString()
  fs.readFile(__dirname+'/index.html', 'utf8', function(err, html){
    html = html.split('{{geojson}}').join(geo)
    console.log(html)
  })
}))