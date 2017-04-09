//var merge = require('merge'), original, cloned;
//console.log(merge({one:'hello'}, {two: 'world'}));
//// -> {"one": "hello", "two": "world"} 
 
//original = { x: { y: 1 } };
//cloned = merge(true, original);
//cloned.x.y++;
 
//console.log(original.x.y, cloned.x.y);
//// -> 1, 2 
 
//console.log(merge.recursive(true, original, { x: { z: 2,y:3 } }));
//// -> {"x": { "y": 1, "z": 2 } } 


var file = process.argv[2];
if(file[0]!='.') file="./"+file;
var a = require(file);
console.log(Object.keys(a.theme).length);
