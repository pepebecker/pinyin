'use strict'

require("babel-core/register")
require("babel-polyfill")

const pinyin = require('pinyin-api')

const getInput = () => document.querySelector('#input').value

const convert = () => {
	const text = getInput()
	if (text) {
		pinyin.convert(text, {keepSpaces: true}).then((data) => {
			document.querySelector('#output').innerHTML = data
		}, console.log)
	}
}

const split = () => {
	const text = getInput()
	if (text) {
		pinyin.split(text).then((data) => {
			document.querySelector('#output').innerHTML = data.join(' ')
		}, console.log)
	}
}

document.querySelector('#convert').addEventListener('click', convert)
document.querySelector('#split').addEventListener('click', split)

document.querySelector('#input').addEventListener('keyup', (event) => {
	if (event.keyCode == 13) {
		event.preventDefault()
		const text = getInput()
		if (text) {
			const re = /^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+$/i
			if (re.test(text)) {
				split()
			} else {
				convert()
			}
		}
	}
})
