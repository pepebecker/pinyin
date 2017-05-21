'use strict'

require("babel-core/register")
require("babel-polyfill")

const pinyin = require('pinyin-api')

const execute = () => {
	const text = document.querySelector('#input').value
	if (text) {
		const re = /^[a-züāáǎàēéěèōóǒòūúǔùīíǐì]+$/i
		if (re.test(text)) {
			pinyin.split(text).then((data) => {
				document.querySelector('#output').innerHTML = data.join(' ')
			}, console.log)
		} else {
			pinyin.convert(text, {keepSpaces: true}).then((data) => {
				document.querySelector('#output').innerHTML = data
			}, console.log)
		}
	}
}

document.querySelector('#convert').addEventListener('click', execute)

document.querySelector('#input').addEventListener('keyup', (event) => {
	if (event.keyCode == 13) {
		event.preventDefault()
		execute()
	}
})
