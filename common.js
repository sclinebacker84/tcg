const fs = require('fs')

exports.getData = () => {
	let DATA = []
	fs.readdirSync(exports.dir+'/input').forEach(f => {
		DATA = DATA.concat(JSON.parse(fs.readFileSync(exports.dir+'/input/'+f)))
	})
	return DATA
}

exports.writeData = (DATA) => {
	fs.writeFileSync(exports.dir+'/output.json', JSON.stringify(DATA, null, 2))
}