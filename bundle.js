"use strict";

(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
			}var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
				var n = t[o][1][e];return s(n ? n : e);
			}, l, l.exports, e, t, n, r);
		}return n[o].exports;
	}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
		s(r[o]);
	}return s;
})({ 1: [function (require, module, exports) {
		module.exports = {
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
		};
	}, {}], 2: [function (require, module, exports) {
		(function (__dirname) {
			'use strict';

			var cangjie = require('./cangjie.json');
			var utils = require('pinyin-utils');
			var isNode = require('detect-node');
			var readline = require('readline');
			var fs = require('fs');
			var path = require('path');

			var storedData = void 0;

			var matches = [];

			var onLine = function onLine(line, query, options, foundMatch) {
				var params = line.split('\t');

				var item = {
					unicode: params[0],
					hanzi: params[1],
					pinyin: params[2],
					cangjie: params[3],
					definition: params[4],
					frequency: params[5]
				};

				if (options.search) {
					if (item.definition.match(new RegExp('\\b(' + query + ')\\b'))) {
						matches.push(item);
					}
				} else {
					if (options.fuzzy) {
						if (utils.removeTone(query) && utils.removeTone(query) === utils.removeTone(item.pinyin)) {
							matches.push(item);
						}
					} else {
						if (query === item.mandarin || query === item.pinyin) {
							matches.push(item);
						}
					}
					if (query === item.cangjie || query === item.unicode || query === item.hanzi) {
						matches = [item];
						foundMatch();
					}
				}
			};

			var onDone = function onDone(options, yay, nay) {
				if (matches.length > 0) {
					matches = matches.map(function (match) {
						var code = match.cangjie.split('');
						code = code.map(function (c) {
							return cangjie[c];
						});
						match.kangjie = code.join('');
						match.frequency = match.frequency || 9;
						return match;
					});
					matches = matches.sort(function (a, b) {
						return a.frequency - b.frequency;
					});
					if (options && options.results) {
						matches = matches.slice(0, options.results);
					}
					yay && yay(matches);
				} else {
					nay && nay('No matches found');
				}
			};

			var loadData = function loadData(done) {
				if (storedData) {
					done && done(storedData);
				} else {
					var client = new XMLHttpRequest();
					client.open('GET', '/data.txt');
					client.onreadystatechange = function () {
						storedData = client.responseText.split('\n');
						console.log('Data sucessfully loaded');
						loadData();
					};
					client.send();
				}
			};

			var find = function find(query) {
				var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
				return new Promise(function (yay, nay) {
					if (isNode) {
						var rl = readline.createInterface({
							input: fs.createReadStream(path.join(__dirname, './data.txt'))
						});

						rl.on('line', function (line) {
							onLine(line, query, options, function () {
								return rl.close();
							});
						});

						rl.on('close', function () {
							onDone(options, yay, nay);
						});
					} else {
						loadData(function (data) {
							var _iteratorNormalCompletion = true;
							var _didIteratorError = false;
							var _iteratorError = undefined;

							try {
								for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
									var line = _step.value;

									onLine(line, query, options, function () {
										onDone();
										return;
									});
								}
							} catch (err) {
								_didIteratorError = true;
								_iteratorError = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion && _iterator.return) {
										_iterator.return();
									}
								} finally {
									if (_didIteratorError) {
										throw _iteratorError;
									}
								}
							}

							onDone(options, yay, nay);
						});
					}
				});
			};

			if (!isNode) {
				loadData();
			}

			module.exports = find;
		}).call(this, "/../../Developer/Node/chinese/hanzi-to-pinyin/node_modules/find-hanzi");
	}, { "./cangjie.json": 1, "detect-node": 3, "fs": 12, "path": 13, "pinyin-utils": 10, "readline": 12 }], 3: [function (require, module, exports) {
		(function (global) {
			module.exports = false;

			// Only Node.JS has a process variable that is of [[Class]] process
			try {
				module.exports = Object.prototype.toString.call(global.process) === '[object process]';
			} catch (e) {}
		}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
	}, {}], 4: [function (require, module, exports) {
		'use strict';

		var findHanzi = require('find-hanzi');
		var so = require('so');

		var convert = function convert(text) {
			return new Promise(function (yay, nay) {
				so(regeneratorRuntime.mark(function _callee() {
					var chars, list, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, char;

					return regeneratorRuntime.wrap(function _callee$(_context) {
						while (1) {
							switch (_context.prev = _context.next) {
								case 0:
									chars = text.split('');

									chars = chars.filter(function (char) {
										return char != ' ';
									});

									list = [];
									_iteratorNormalCompletion2 = true;
									_didIteratorError2 = false;
									_iteratorError2 = undefined;
									_context.prev = 6;
									_iterator2 = chars[Symbol.iterator]();

								case 8:
									if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
										_context.next = 15;
										break;
									}

									char = _step2.value;
									_context.next = 12;
									return findHanzi(char).then(function (data) {
										list.push(data[0].pinyin);
									}, nay);

								case 12:
									_iteratorNormalCompletion2 = true;
									_context.next = 8;
									break;

								case 15:
									_context.next = 21;
									break;

								case 17:
									_context.prev = 17;
									_context.t0 = _context["catch"](6);
									_didIteratorError2 = true;
									_iteratorError2 = _context.t0;

								case 21:
									_context.prev = 21;
									_context.prev = 22;

									if (!_iteratorNormalCompletion2 && _iterator2.return) {
										_iterator2.return();
									}

								case 24:
									_context.prev = 24;

									if (!_didIteratorError2) {
										_context.next = 27;
										break;
									}

									throw _iteratorError2;

								case 27:
									return _context.finish(24);

								case 28:
									return _context.finish(21);

								case 29:

									yay(list.join(' '));

								case 30:
								case "end":
									return _context.stop();
							}
						}
					}, _callee, this, [[6, 17, 21, 29], [22,, 24, 28]]);
				}))();
			});
		};

		module.exports = convert;
	}, { "find-hanzi": 2, "so": 5 }], 5: [function (require, module, exports) {
		'use strict';

		/**
   * Expose `so` (ES6 friedly)
   */

		module.exports = so['default'] = so.so = so;

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
			return function () {
				var gen = fn.apply(this, arguments);
				try {
					return resolved();
				} catch (e) {
					return Promise.reject(e);
				}
				function resolved(res) {
					return next(gen.next(res));
				}
				function rejected(err) {
					return next(gen.throw(err));
				}
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
	}, {}], 6: [function (require, module, exports) {
		'use strict';

		var hanziToPinyin = require('hanzi-to-pinyin');
		var splitPinyin = require('pinyin-split');
		var pinyinOrHanzi = require('pinyin-or-hanzi');
		var utils = require('pinyin-utils');

		var convert = function convert(text) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			return new Promise(function (yay, nay) {
				pinyinOrHanzi(text).then(function (type) {
					if (type === 1) {
						hanziToPinyin(text).then(function (data) {
							if (options.numbered) {
								var words = data.split(' ');
								words = words.map(utils.markToNumber);
								yay(words.join(' '));
							} else {
								yay(data);
							}
						}, nay);
					}
					if (type === 2 || type === 3) {
						splitPinyin(text, options.keepSpacing).then(function (words) {
							if (options.numbered && type !== 3) {
								words = words.map(utils.markToNumber);
							}
							if (options.marked && type !== 2) {
								words = words.map(utils.numberToMark);
							}
							if (!options.numbered && !options.numbered) {
								if (type === 2) {
									words = words.map(utils.markToNumber);
								}
								if (type === 3) {
									words = words.map(utils.numberToMark);
								}
							}
							yay(words.join(options.keepSpacing ? '' : ' '));
						});
					}
				});
			});
		};

		module.exports = convert;
	}, { "hanzi-to-pinyin": 4, "pinyin-or-hanzi": 7, "pinyin-split": 9, "pinyin-utils": 10 }], 7: [function (require, module, exports) {
		'use strict';

		var utils = require('pinyin-utils');
		var findHanzi = require('find-hanzi');

		var check = function check(text) {
			return new Promise(function (yay, nay) {
				if (text.match(new RegExp('[a-z]+[1-4]'))) {
					yay(3);
					return;
				} else {
					for (var i in utils.vovels) {
						var _iteratorNormalCompletion3 = true;
						var _didIteratorError3 = false;
						var _iteratorError3 = undefined;

						try {
							for (var _iterator3 = utils.vovels[i][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
								var tone = _step3.value;

								if (text.match(tone)) {
									yay(2);
									return;
								}
							}
						} catch (err) {
							_didIteratorError3 = true;
							_iteratorError3 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion3 && _iterator3.return) {
									_iterator3.return();
								}
							} finally {
								if (_didIteratorError3) {
									throw _iteratorError3;
								}
							}
						}
					}
				}

				var chars = text.split('');
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = chars[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var char = _step4.value;

						findHanzi(char).then(function (data) {
							var _iteratorNormalCompletion5 = true;
							var _didIteratorError5 = false;
							var _iteratorError5 = undefined;

							try {
								for (var _iterator5 = data[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
									var item = _step5.value;

									if (text.match(item.hanzi)) {
										yay(1);
										return;
									}
								}
							} catch (err) {
								_didIteratorError5 = true;
								_iteratorError5 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion5 && _iterator5.return) {
										_iterator5.return();
									}
								} finally {
									if (_didIteratorError5) {
										throw _iteratorError5;
									}
								}
							}
						}, nay);
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
			});
		};

		module.exports = check;
	}, { "find-hanzi": 2, "pinyin-utils": 10 }], 8: [function (require, module, exports) {
		module.exports = ["uāng", "iāng", "ióng", "uáng", "iǎng", "iǒng", "uǎng", "iáng", "iōng", "iàng", "iòng", "uàng", "iang", "iong", "uang", "íng", "uái", "uán", "áng", "ián", "iáo", "īng", "uāi", "uān", "ěng", "ǒng", "ǐng", "āng", "uǎn", "ǎng", "iǎn", "iǎo", "iān", "iāo", "uai", "ēng", "èng", "òng", "ìng", "uài", "uàn", "àng", "iàn", "iào", "iao", "ian", "ang", "uan", "ōng", "éng", "óng", "eng", "ong", "ing", "uǎi", "iá", "ié", "ái", "iú", "un", "ue", "an", "ui", "ou", "ūn", "ēn", "iā", "iē", "āi", "iū", "iu", "ai", "ie", "ia", "en", "ěi", "ěr", "ǐn", "uǎ", "uǒ", "ǎo", "ǒu", "uǐ", "ǎn", "uě", "ǔn", "ěn", "iǎ", "iě", "ǎi", "iǔ", "ao", "uo", "ua", "in", "er", "ēi", "ēr", "īn", "uā", "uō", "āo", "ōu", "uī", "ān", "uē", "éi", "èi", "èr", "ìn", "uà", "uò", "ào", "òu", "uì", "àn", "uè", "ùn", "èn", "ià", "iè", "ài", "iù", "ei", "ér", "ín", "uá", "uó", "áo", "óu", "uí", "án", "ué", "ún", "én", "ú", "à", "ù", "ò", "ì", "ǎ", "ě", "ǔ", "ǒ", "ǐ", "á", "é", "è", "ó", "í", "ā", "ē", "ū", "ō", "ī", "i", "o", "u", "e", "a"];
	}, {}], 9: [function (require, module, exports) {
		'use strict';

		var finals = require('./finals.json');

		var pad = function pad(n, width, z) {
			z = z || '0';
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		};

		var split = function split(text) {
			var keepSpaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
			return new Promise(function (yay, nay) {
				var matchedFinals = [];
				var index = 0;
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = finals[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var f = _step6.value;

						var matches = text.match(new RegExp(f + '[1-4]*', 'g'));
						if (matches) {
							var _iteratorNormalCompletion8 = true;
							var _didIteratorError8 = false;
							var _iteratorError8 = undefined;

							try {
								for (var _iterator8 = matches[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
									var match = _step8.value;

									var id = '$@' + pad(index, 10);
									matchedFinals.push({ value: match, id: id });
									text = text.replace(match, id);
									index++;
								}
							} catch (err) {
								_didIteratorError8 = true;
								_iteratorError8 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion8 && _iterator8.return) {
										_iterator8.return();
									}
								} finally {
									if (_didIteratorError8) {
										throw _iteratorError8;
									}
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}

				var _iteratorNormalCompletion7 = true;
				var _didIteratorError7 = false;
				var _iteratorError7 = undefined;

				try {
					for (var _iterator7 = matchedFinals[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
						var final = _step7.value;

						text = text.replace(final.id, final.value + ',');
					}
				} catch (err) {
					_didIteratorError7 = true;
					_iteratorError7 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion7 && _iterator7.return) {
							_iterator7.return();
						}
					} finally {
						if (_didIteratorError7) {
							throw _iteratorError7;
						}
					}
				}

				var words = text.replace(/ /g, '').split(',');
				words.splice(-1, 1);

				if (keepSpaces) {
					words = text.replace(/ /g, ' ,').split(',');
					words.splice(-1, 1);
				}

				yay(words);
			});
		};

		module.exports = split;
	}, { "./finals.json": 8 }], 10: [function (require, module, exports) {
		'use strict';

		var unicodeToHanzi = function unicodeToHanzi(unicode) {
			unicode = unicode.replace('U+', '');
			return String.fromCharCode(parseInt(unicode, 16));
		};

		var vovels = {
			"a": ['ā', 'á', 'ǎ', 'à'],
			"e": ['ē', 'é', 'ě', 'è'],
			"i": ['ī', 'í', 'ǐ', 'ì'],
			"o": ['ō', 'ó', 'ǒ', 'ò'],
			"u": ['ū', 'ú', 'ǔ', 'ù'],
			"ü": ['ǖ', 'ǘ', 'ǚ', 'ǜ']
		};

		var getToneNumber = function getToneNumber(text) {
			text = text.toLowerCase();

			var tone = 0;

			for (var v in vovels) {
				for (var i = 0; i < vovels[v].length; i++) {
					var t = i + 1;
					if (text.match(vovels[v][i])) {
						tone = t;
						break;
					}
					if (text.match(new RegExp('[a-z]+' + t))) {
						tone = t;
						break;
					}
				}
			}

			return tone;
		};

		var removeTone = function removeTone(text) {
			var removed = false;

			// remove tone from pinyin with tone marks
			if (getToneNumber(text) > 0) {
				for (var i in vovels) {
					var _iteratorNormalCompletion9 = true;
					var _didIteratorError9 = false;
					var _iteratorError9 = undefined;

					try {
						for (var _iterator9 = vovels[i][Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
							var t = _step9.value;

							if (text.match(t)) {
								text = text.replace(t, i);
								removed = true;
							}
						}
					} catch (err) {
						_didIteratorError9 = true;
						_iteratorError9 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion9 && _iterator9.return) {
								_iterator9.return();
							}
						} finally {
							if (_didIteratorError9) {
								throw _iteratorError9;
							}
						}
					}
				}
			}

			// remove tone from pinyin with tone numbers
			var matches = text.match(/[1-4]/);
			if (matches && matches.length > 0) {
				text = text.replace(matches[0], '');
				removed = true;
			}

			return removed && text;
		};

		var markToNumber = function markToNumber(text) {
			var tone = getToneNumber(text);

			if (tone > 0) {
				for (var v in vovels) {
					for (var t = 0; t < vovels[v].length; t++) {
						if (text.match(vovels[v][t])) {
							text = text.replace(vovels[v][t], v);
						}
					}
				}
				text += tone;
			}

			return text;
		};

		var numberToMark = function numberToMark(text) {
			var tone = getToneNumber(text);

			if (tone > 0) {
				text = text.replace(/[1-4]/, '');

				var matchedVovels = text.match(/[aeiouü]/g);
				if (matchedVovels) {
					var vovel = matchedVovels[matchedVovels.length - 1];

					if (text.match('ou')) vovel = 'o';
					if (text.match('a')) vovel = 'a';
					if (text.match('e')) vovel = 'e';

					text = text.replace(vovel, vovels[vovel][tone - 1]);
				}
			}

			return text;
		};

		module.exports = { unicodeToHanzi: unicodeToHanzi, vovels: vovels, getToneNumber: getToneNumber, removeTone: removeTone, markToNumber: markToNumber, numberToMark: numberToMark };
	}, {}], 11: [function (require, module, exports) {
		'use strict';

		var convert = require('pinyin-converter');

		var execute = function execute() {
			var text = document.querySelector('#input').value;
			if (text) {
				convert(text, { keepSpacing: true }).then(function (data) {
					document.querySelector('#output').innerHTML = data;
				}, console.log);
			}
		};

		document.querySelector('#convert').addEventListener('click', execute);

		document.querySelector('#input').addEventListener('keyup', function (event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				execute();
			}
		});
	}, { "pinyin-converter": 6 }], 12: [function (require, module, exports) {}, {}], 13: [function (require, module, exports) {
		(function (process) {
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
			var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
			var splitPath = function splitPath(filename) {
				return splitPathRe.exec(filename).slice(1);
			};

			// path.resolve([from ...], to)
			// posix version
			exports.resolve = function () {
				var resolvedPath = '',
				    resolvedAbsolute = false;

				for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
					var path = i >= 0 ? arguments[i] : process.cwd();

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
				resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
					return !!p;
				}), !resolvedAbsolute).join('/');

				return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
			};

			// path.normalize(path)
			// posix version
			exports.normalize = function (path) {
				var isAbsolute = exports.isAbsolute(path),
				    trailingSlash = substr(path, -1) === '/';

				// Normalize the path
				path = normalizeArray(filter(path.split('/'), function (p) {
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
			exports.isAbsolute = function (path) {
				return path.charAt(0) === '/';
			};

			// posix version
			exports.join = function () {
				var paths = Array.prototype.slice.call(arguments, 0);
				return exports.normalize(filter(paths, function (p, index) {
					if (typeof p !== 'string') {
						throw new TypeError('Arguments to path.join must be strings');
					}
					return p;
				}).join('/'));
			};

			// path.relative(from, to)
			// posix version
			exports.relative = function (from, to) {
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

			exports.dirname = function (path) {
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

			exports.basename = function (path, ext) {
				var f = splitPath(path)[2];
				// TODO: make this comparison case-insensitive on windows?
				if (ext && f.substr(-1 * ext.length) === ext) {
					f = f.substr(0, f.length - ext.length);
				}
				return f;
			};

			exports.extname = function (path) {
				return splitPath(path)[3];
			};

			function filter(xs, f) {
				if (xs.filter) return xs.filter(f);
				var res = [];
				for (var i = 0; i < xs.length; i++) {
					if (f(xs[i], i, xs)) res.push(xs[i]);
				}
				return res;
			}

			// String.prototype.substr - negative index don't work in IE8
			var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
				return str.substr(start, len);
			} : function (str, start, len) {
				if (start < 0) start = str.length + start;
				return str.substr(start, len);
			};
		}).call(this, require('_process'));
	}, { "_process": 14 }], 14: [function (require, module, exports) {
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
		function defaultClearTimeout() {
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
		})();
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
			} catch (e) {
				try {
					// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
					return cachedSetTimeout.call(null, fun, 0);
				} catch (e) {
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
			} catch (e) {
				try {
					// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
					return cachedClearTimeout.call(null, marker);
				} catch (e) {
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
			while (len) {
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

		process.cwd = function () {
			return '/';
		};
		process.chdir = function (dir) {
			throw new Error('process.chdir is not supported');
		};
		process.umask = function () {
			return 0;
		};
	}, {}] }, {}, [11]);
