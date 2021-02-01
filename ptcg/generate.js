const common = require('../common')
common.dir = __dirname
common.app = 'ptcg'

const DATA = Object.values(common.getData(__dirname).reduce((a,c) => {
	a[c.id] = {
		name:c.name,
		id:c.id,
		imageUrl:c.imageUrl,
		series:c.series,
		level:parseInt(c.level) || 0,
		evolvesFrom:c.evolvesFrom,
		ability:c.ability,
		hp:parseInt(c.hp) || 0,
		retreatCost:c.convertedRetreatCost,
		category:`${c.supertype}/${c.subtype}`,
		type:c.types && c.types[0],
		attacks:c.attacks && c.attacks.map(a => ({
			name:a.name,
			cost:a.cost,
			damage:parseInt(a.damage) || 0,
			text:a.text
		})) || []
	}
	return a
}, {}))

common.writeData(DATA)