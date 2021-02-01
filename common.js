const fs = require('fs')
const path = require('path')

exports.getData = () => {
	let DATA = []
	fs.readdirSync(exports.dir+'/input').forEach(f => {
		DATA = DATA.concat(JSON.parse(fs.readFileSync(exports.dir+'/input/'+f)))
	})
	return Object.values(DATA.reduce((a,c) => {
		a[c.name+c.series] = c
		return a
	}, {}))
}

exports.writeData = (DATA) => {
	fs.writeFileSync(path.resolve(exports.dir, `../static/${exports.app}/data.js`), `window.DATA = ${JSON.stringify(DATA)}`)
}