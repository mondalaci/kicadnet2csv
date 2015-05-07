#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Parse = require('s-expression');
var isArray = require('is-array');

function objectify(input) {
    if (typeof input === 'string') {
        return input;
    }

    var key = input.shift();

    var output = {};
    output[key] = input.length === 1 ? input[0] : input.map(objectify);
    return output;
}

function unnestify(input) {
    input = stringify(input);
    var output = {};

    if (typeof input === 'string') {
        return input;
    }

    if (isArray(input)) {
        input.forEach(function(obj) {
            if (typeof obj === 'string') {
                if (!output.$) {
                    output.$ = [];
                }
                output.$.push(obj);
                return;
            }

            for (var key in obj) {
                var objVal = unnestify(obj[key]);
                if (!(key in output)) {
                    output[key] = [objVal];
                } else {
                    output[key].push(objVal);
                }
            }
        });

        for (var key in output) {
            var array = output[key];
            if (array.length === 1) {
                output[key] = array[0];
            }
        }
    } else {  // object
        for (var key in input) {
            if (input.hasOwnProperty(key)) {
                output[key] = unnestify(input[key]);
            }
        }
    }

    return output;
}

function stringify(input) {
    if (isArray(input) || typeof input === 'string') {
        return input;
    }
    var output = '';
    for (var i=0; i in input; i++) {
        output += input[i];
    }
    return output.length > 0 ? output : input;
}

var fileContent = fs.readFileSync(process.argv[2], {encoding:'utf8'});
var parsedNetlist = Parse(fileContent);
console.log(JSON.stringify(unnestify(objectify(parsedNetlist)), null, 4));
