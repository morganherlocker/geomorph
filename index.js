var concat = require('concat-stream')
var argv = require('minimist')(process.argv.slice(2))
var fs = require('fs')

((argv._[0] && fs.createReadStream(argv._[0])) || process.stdin).pipe(concat(openData));

console.log(argv)