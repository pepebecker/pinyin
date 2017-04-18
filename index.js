const convert = require('pinyin-converter')

const execute = () => {
	const text = document.querySelector('#input').value
	if (text) {
		convert(text, {keepSpacing: true}).then((data) => {
			document.querySelector('#output').innerHTML = data
		}, console.log)
	}
}

document.querySelector('#convert').addEventListener('click', execute)

document.querySelector('#input').addEventListener('keyup', (event) => {
	if (event.keyCode == 13) {
		event.preventDefault()
		execute()
	}
})