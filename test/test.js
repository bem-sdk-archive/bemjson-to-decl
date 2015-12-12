var inspect = require('util').inspect,
    assert = require('assert'),
    bemjsonToDecl = require('..'),
    testsNumber = 4,
    errorsCount = 0;

while (testsNumber) {
    var bemjson = require('./test' + testsNumber + '.bemjson.js'),
        reference = require('./reference' + testsNumber + '.deps.js');

    try {
        assert.deepEqual(bemjsonToDecl.convert(bemjson), reference, 'Test #' + testsNumber + ' failed');
    } catch(err) {
        console.log(err.message);
        console.log('bemjson', bemjson);
        console.log('convert\n', bemjsonToDecl.convert(bemjson));
        console.log('\nreference\n', inspect(reference, { depth: null }));
        errorsCount++;
    }

    testsNumber--;
}

if(errorsCount > 0) {
    throw new Error('Tests have been failed');
}
