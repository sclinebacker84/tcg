import { h, Component, render } from '../preact.module.js'

window.CONFIG.title = 'Pokemon Card Game'
window.CONFIG.cards = {
	hand:3,
	active:1
}

class DeckBuilderModalFooter extends Component {
	render(){
		const chips = [
			{name:'Series',value:this.props.card.series},
			{name:'Level',value:this.props.card.level || 0}
		]
		return chips.map(c => h('span',{class:'chip'},`${c.name}: ${c.value}`))
	}
}
window.DeckBuilderModalFooter = DeckBuilderModalFooter

class DeckBuilderSearch extends Component {
	search(e){
		e.preventDefault()
		const results = this.state.search && DATA.filter(c => {
			return c.name.toLowerCase().includes(this.state.search) || 
			c.category.toLowerCase().includes(this.state.search) ||
			c.type && c.type.toLowerCase() === this.state.search
		}) || []
		this.props.refresh({results:results,showingMine:false})
	}
	render(){
		return h('div',{class:'columns mt-1'},
			h('div',{class:'col-10 col-mx-auto'},
				h('form',{class:'has-icon-right',onSubmit:e => this.search(e)},
					h('input',{class:'form-input text-center',placeholder:'enter card name, category, or type',onInput:e => this.setState({search:e.target.value.toLowerCase()})}),
					h('i',{class:'form-icon icon icon-search'})
				)
			)
		)
	}
}
window.DeckBuilderSearch = DeckBuilderSearch