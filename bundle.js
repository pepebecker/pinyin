(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
	"A": "日",
	"B": "月",
	"C": "金",
	"D": "木",
	"E": "水",
	"F": "火",
	"G": "土",
	"H": "竹",
	"I": "戈",
	"J": "十",
	"K": "大",
	"L": "中",
	"M": "一",
	"N": "弓",
	"O": "人",
	"P": "心",
	"Q": "手",
	"R": "口",
	"S": "尸",
	"T": "廿",
	"U": "山",
	"V": "女",
	"W": "田",
	"X": "難",
	"Y": "卜",
	"Z": "重"
}
},{}],2:[function(require,module,exports){
(function (__dirname){
'use strict'

const cangjie = require('./cangjie.json')
const utils = require('pinyin-utils')
const readline = require('readline')
const fs = require('fs')
const path = require('path')

const find = (query, options = {}) => new Promise((yay, nay) => {
	const rl = readline.createInterface({
		input: fs.createReadStream(path.join(__dirname, './data.txt'))
	})

	let matches = []

	rl.on('line', function (line) {
		const params = line.split('\t')

		let item = {
			unicode: params[0],
			hanzi: params[1],
			pinyin: params[2],
			cangjie: params[3],
			definition: params[4],
			frequency: params[5]
		}

		if (options.search) {
			if (item.definition.match(new RegExp('\\b(' + query + ')\\b'))) {
				matches.push(item)
			}
		} else {
			if (options.fuzzy) {
				if (utils.removeTone(query) && utils.removeTone(query) === utils.removeTone(item.pinyin)) {
					matches.push(item)
				}
			} else {
				if (query === item.mandarin || query === item.pinyin) {
					matches.push(item)
				}
			}
			if (query === item.cangjie || query === item.unicode || query === item.hanzi) {
				matches = [item]
				rl.close()
			}
		}
	})

	rl.on('close', function () {
		if (matches.length > 0) {
			matches = matches.map((match) => {
				let code = match.cangjie.split('')
				code = code.map((c) => cangjie[c])
				match.kangjie = code.join('')
				match.frequency = match.frequency || 9
				return match
			})
			matches = matches.sort((a, b) => a.frequency - b.frequency)
			if (options.results) {
				matches = matches.slice(0, options.results)
			}
			yay(matches)
		} else {
			nay('No matches found')
		}
	})
})

module.exports = find

}).call(this,"/../../Developer/Node/chinese/hanzi-to-pinyin/node_modules/find-hanzi")
},{"./cangjie.json":1,"fs":11,"path":12,"pinyin-utils":9,"readline":11}],3:[function(require,module,exports){
'use strict'

const findHanzi = require('find-hanzi')
const so = require('so')

const convert = (text, options = {}) => new Promise((yay, nay) => {
	so(function*(){
		let chars = text.split('')
		let list = []

		for (let char of chars) {
			yield findHanzi(char).then((data) => {
				list.push(data[0].pinyin)
			}, console.error)
		}

		yay(list.join(' '))
	})()
})

module.exports = convert

},{"find-hanzi":2,"so":4}],4:[function(require,module,exports){
'use strict';

/**
 * Expose `so` (ES6 friedly)
 */

module.exports = so['default'] = so.so = so

/**
 * Converts `fn` generator function
 * into function that returns a promise while handling
 * all `yield` calls in the body as blocking promises.
 * Based on ForbesLindesay's presentation with slight modification
 * http://pag.forbeslindesay.co.uk/#/
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 *
 * @api public
 */

function so(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    try {
      return resolved();
    } catch (e) {
      return Promise.reject(e);
    }
    function resolved(res) { return next(gen.next(res)); }
    function rejected(err) { return next(gen.throw(err)); }
    function next(ret) {
      var val = ret.value;
      if (ret.done) {
        return Promise.resolve(val);
      } else if ('function' === typeof val.then) {
        return val.then(resolved, rejected);
      } else {
        throw new Error('Expected Promise');
      }
    }
  };
}
},{}],5:[function(require,module,exports){
'use strict'

const hanziToPinyin = require('hanzi-to-pinyin')
const splitPinyin = require('pinyin-split')
const pinyinOrHanzi = require('pinyin-or-hanzi')
const utils = require('pinyin-utils')

const convert = (text, options = {}) => new Promise((yay, nay) => {
	pinyinOrHanzi(text).then((type) => {
		if (type === 1) {
			hanziToPinyin(text).then((data) => {
				if (options.numbered) {
					let words = data.split(' ')
					words = words.map(utils.markToNumber)
					yay(words.join(' '))
				} else {
					yay(data)
				}
			}, nay)
		}
		if (type === 2 || type === 3) {
			splitPinyin(text, options.keepSpacing).then((words) => {
				if (options.numbered && type !== 3) {
					words = words.map(utils.markToNumber)
				}
				if (options.marked && type !== 2) {
					words = words.map(utils.numberToMark)
				}
				if (!options.numbered && !options.numbered) {
					if (type === 2) {
						words = words.map(utils.markToNumber)
					}
					if (type === 3) {
						words = words.map(utils.numberToMark)
					}
				}
				yay(words.join(options.keepSpacing ? '' : ' '))
			})
		}
	})
})

module.exports = convert

},{"hanzi-to-pinyin":3,"pinyin-or-hanzi":6,"pinyin-split":8,"pinyin-utils":9}],6:[function(require,module,exports){
'use strict'

const utils = require('pinyin-utils')
const findHanzi = require('find-hanzi')

const check = (text) => new Promise((yay, nay) => {
	if (text.match(new RegExp('[a-z]+[1-4]'))) {
		yay(3)
		return
	} else {
		for (let i in utils.vovels) {
			for (let tone of utils.vovels[i]) {
				if (text.match(tone)) {
					yay(2)
					return
				}
			}
		}
	}

	const chars = text.split('')
	for (let char of chars) {
		findHanzi(char).then((data) => {
			for (let item of data) {
				if (text.match(item.hanzi)) {
					yay(1)
					return
				}
			}
		}, nay)
	}
})

module.exports = check

},{"find-hanzi":2,"pinyin-utils":9}],7:[function(require,module,exports){
module.exports=[
	"uāng",
	"iāng",
	"ióng",
	"uáng",
	"iǎng",
	"iǒng",
	"uǎng",
	"iáng",
	"iōng",
	"iàng",
	"iòng",
	"uàng",
	"iang",
	"iong",
	"uang",
	"íng",
	"uái",
	"uán",
	"áng",
	"ián",
	"iáo",
	"īng",
	"uāi",
	"uān",
	"ěng",
	"ǒng",
	"ǐng",
	"āng",
	"uǎn",
	"ǎng",
	"iǎn",
	"iǎo",
	"iān",
	"iāo",
	"uai",
	"ēng",
	"èng",
	"òng",
	"ìng",
	"uài",
	"uàn",
	"àng",
	"iàn",
	"iào",
	"iao",
	"ian",
	"ang",
	"uan",
	"ōng",
	"éng",
	"óng",
	"eng",
	"ong",
	"ing",
	"uǎi",
	"iá",
	"ié",
	"ái",
	"iú",
	"un",
	"ue",
	"an",
	"ui",
	"ou",
	"ūn",
	"ēn",
	"iā",
	"iē",
	"āi",
	"iū",
	"iu",
	"ai",
	"ie",
	"ia",
	"en",
	"ěi",
	"ěr",
	"ǐn",
	"uǎ",
	"uǒ",
	"ǎo",
	"ǒu",
	"uǐ",
	"ǎn",
	"uě",
	"ǔn",
	"ěn",
	"iǎ",
	"iě",
	"ǎi",
	"iǔ",
	"ao",
	"uo",
	"ua",
	"in",
	"er",
	"ēi",
	"ēr",
	"īn",
	"uā",
	"uō",
	"āo",
	"ōu",
	"uī",
	"ān",
	"uē",
	"éi",
	"èi",
	"èr",
	"ìn",
	"uà",
	"uò",
	"ào",
	"òu",
	"uì",
	"àn",
	"uè",
	"ùn",
	"èn",
	"ià",
	"iè",
	"ài",
	"iù",
	"ei",
	"ér",
	"ín",
	"uá",
	"uó",
	"áo",
	"óu",
	"uí",
	"án",
	"ué",
	"ún",
	"én",
	"ú",
	"à",
	"ù",
	"ò",
	"ì",
	"ǎ",
	"ě",
	"ǔ",
	"ǒ",
	"ǐ",
	"á",
	"é",
	"è",
	"ó",
	"í",
	"ā",
	"ē",
	"ū",
	"ō",
	"ī",
	"i",
	"o",
	"u",
	"e",
	"a"
]

},{}],8:[function(require,module,exports){
'use strict'

const finals = require('./finals.json')

const pad = (n, width, z) => {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const split = (text, keepSpaces = false) => new Promise((yay, nay) => {
	let matchedFinals = []
	let index = 0
	for (let f of finals) {
		let matches = text.match(new RegExp(f + '[1-4]*', 'g'))
		if (matches) {
			for (let match of matches) {
				const id = '$@' + pad(index, 10)
				matchedFinals.push({value: match, id: id})
				text = text.replace(match, id)
				index ++
			}
		}
	}

	for (let final of matchedFinals) {
		text = text.replace(final.id, final.value + ',')
	}

	let words = text.replace(/ /g, '').split(',')
	words.splice(-1,1)

	if (keepSpaces) {
		words = text.replace(/ /g, ' ,').split(',')
		words.splice(-1,1)
	}

	yay(words)
})

module.exports = split

},{"./finals.json":7}],9:[function(require,module,exports){
'use strict'

const unicodeToHanzi = (unicode) => {
	unicode = unicode.replace('U+', '')
	return String.fromCharCode(parseInt(unicode, 16))
}

const vovels = {
	"a": ['ā', 'á', 'ǎ', 'à'],
	"e": ['ē', 'é', 'ě', 'è'],
	"i": ['ī', 'í', 'ǐ', 'ì'],
	"o": ['ō', 'ó', 'ǒ', 'ò'],
	"u": ['ū', 'ú', 'ǔ', 'ù'],
	"ü": ['ǖ', 'ǘ', 'ǚ', 'ǜ']
}

const getToneNumber = (text) => {
	text = text.toLowerCase()

	let tone = 0

	for (let v in vovels) {
		for (var i = 0; i < vovels[v].length; i++) {
			const t = i + 1
			if (text.match(vovels[v][i])) {
				tone = t
				break
			}
			if (text.match(new RegExp('[a-z]+'+t))) {
				tone = t
				break
			}
		}
	}

	return tone
}

const removeTone = (text) => {
	let removed = false

	// remove tone from pinyin with tone marks
	if (getToneNumber(text) > 0) {
		for (let i in vovels) {
			for (let t of vovels[i]) {
				if (text.match(t)) {
					text = text.replace(t, i)
					removed = true
				}
			}
		}
	}

	// remove tone from pinyin with tone numbers
	const matches = text.match(/[1-4]/)
	if (matches && matches.length > 0) {
		text = text.replace(matches[0], '')
		removed = true
	}

	return removed && text
}

const markToNumber = (text) => {
	const tone = getToneNumber(text)

	if (tone > 0) {
		for (let v in vovels) {
			for (var t = 0; t < vovels[v].length; t++) {
				if (text.match(vovels[v][t])) {
					text = text.replace(vovels[v][t], v)
				}
			}
		}
		text += tone
	}

	return text	
}

const numberToMark = (text) => {
	const tone = getToneNumber(text)

	if (tone > 0) {
		text = text.replace(/[1-4]/, '')

		const matchedVovels = text.match(/[aeiouü]/g)
		if (matchedVovels) {
			let vovel = matchedVovels[matchedVovels.length-1]

			if (text.match('a')) vovel = 'a'
			if (text.match('e')) vovel = 'e'
			if (text.match('ou')) vovel = 'o'

			text = text.replace(vovel, vovels[vovel][tone-1])
		}
	}

	return text
}

module.exports = {unicodeToHanzi, vovels, getToneNumber, removeTone, markToNumber, numberToMark}

},{}],10:[function(require,module,exports){
const convert = require('pinyin-converter')

const execute = () => {
	const text = document.querySelector('#input').value
	if (text) {
		convert(text, {keepSpacing: true}).then((data) => {
			document.querySelector('#output').innerHTML = data
		}, console.error)
	}
}

document.querySelector('#convert').addEventListener('click', execute)

document.querySelector('#input').addEventListener('keyup', (event) => {
	if (event.keyCode == 13) {
		execute()
	}
})
},{"pinyin-converter":5}],11:[function(require,module,exports){

},{}],12:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":13}],13:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[10]);
