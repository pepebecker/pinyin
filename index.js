const convert = require('pinyin-converter')

document.querySelector('#convert').addEventListener('click', (event) => {
	const text = document.querySelector('#input').value
	if (text) {
		convert(text).then((data) => {
			document.querySelector('#output').innerHTML = data
		}, console.error)
	}
})
