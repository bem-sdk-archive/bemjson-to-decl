var stringifyBemDecl = require('bem-decl').stringify,
    normalize = require('bem-decl').normalize,
    BemEntity = require('@bem/entity-name'),
    naming = require('bem-naming');

function getEntities(bemjson, ctx) {
    var visited = [];

    function _getEntities(bemjson, ctx) {
        ctx = Object.assign({}, ctx);

        var deps = [],
            contentDeps;

        if (Array.isArray(bemjson)) {
            bemjson.forEach(function(item) {
                contentDeps = _getEntities(item, ctx);
                contentDeps && (deps = deps.concat(contentDeps));
            });

            return deps;
        }

        if (typeof bemjson !== 'object') return;

        bemjson.block && (ctx.block = bemjson.block);

        var declItem = {
            block: ctx.block
        };

        bemjson.elem && (declItem.elem = bemjson.elem);
        bemjson.mods && (declItem.mods = bemjson.mods);
        bemjson.elem && bemjson.elemMods && (declItem.mods = bemjson.elemMods);

        var decl = normalize(declItem, {harmony: true});

        decl.forEach(function(declItem) {
            function pushTo(declItem) {
                var depName = naming.stringify(declItem);
                if (visited.indexOf(depName) < 0) {
                    visited.push(depName);
                    deps.push(new BemEntity(declItem));
                }
            }
            pushTo(declItem);
            if (declItem.modName && declItem.modVal !== true) {
                pushTo(Object.assign({}, declItem, {modVal: true}));
            }
        });

        ['mix', 'content'].forEach(function(k) {
            bemjson[k] && (deps = deps.concat(_getEntities(bemjson[k], ctx)));
        });

        ['js', 'attrs'].forEach(function(k) {
            bemjson[k] && Object.keys(bemjson[k]).forEach(function(kk) {
                deps = deps.concat(_getEntities(bemjson[k][kk], ctx));
            });
        });

        return deps.filter(Boolean);
    }

    return _getEntities(bemjson, ctx);
}

function stringify(bemjson, ctx, opts) {
    opts || (opts = {});
    opts.indent || (opts.indent = '    ');

    console.log(getEntities(bemjson, ctx));

    return stringifyBemDecl(getEntities(bemjson, ctx), opts);
}

module.exports = {
    convert: getEntities,
    stringify: stringify
};
