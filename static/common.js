window.CONFIG = {}

import { h, Component, render } from './preact.module.js'
const PARAMS = new URLSearchParams(window.location.search)

const loadScript = (script, isModule, cb) => {
	const s = document.createElement('script')
	s.setAttribute('src', `${PARAMS.get('app')}/${script}.js`)
	if(isModule){
		s.setAttribute('type', 'module')
	}
	s.onload = cb
	document.head.appendChild(s)
}

class Modal extends Component {
	content(){
		return undefined
	}
	footer(){
		return undefined
	}
	render(){
		return h('div',{class:`modal${this.props.show ? ' active' : ''}`,id:this.props.id},
			h('div',{class:'text-center modal-overlay'},
				h('div',{class:'mt-2 modal-container d-inline-flex',style:'max-height: 1000em'},
					h('div',{class:'modal-header'},
						h('button',{class:'btn btn-clear float-right',onClick:e => this.props.close()}),
						h('div',{class:'modal-title h5'},this.props.title)
					),
					h('div',{class:'modal-body'},
						h('div',{class:'content text-center'},
							this.content()
						)
					),
					h('div',{class:'modal-footer'},
						h('div',{class:'content text-center'},
							this.footer()
						)
					)
				)
			)
		)
	}
}
window.Modal = Modal

class Stats extends Component {
	forfeit(e){

	}
	endgame(e){

	}
	render(){
		return h('div',{class:'columns'},
			h('div',{class:'column col-4 text-center'},
				h('label',{class:'form-label'},`${window.GAME.left.name}: ${window.GAME.left.score}`)
			),
			h('div',{class:'column col-4 text-center'},
				h('button',{class:'btn',onClick:e => this.forfeit(e)},'Forfeit'),
				h('button',{class:'btn',onClick:e => this.endgame(e)},'End Game')
			),
			h('div',{class:'column col-4 text-center'},
				h('label',{class:'form-label'},`${window.GAME.right.name}: ${window.GAME.right.score}`)
			)
		)
	}
}

class Player extends Component {
	render(){
		return h('div',{class:'text-center'},
			this.props.player.active.map(c => h('div',{class:'container'},
				h('img',{class:'img-responsive d-inline-flex',src:c.imageUrl})
			))
		)
	}
}

class Arena extends Component {
	render(){
		return h('div',{class:'columns'},
			h('div',{class:'column col-6 col-sm-12'},
				h(Player, {player:window.GAME.left})
			),
			h('div',{class:'column col-6 col-sm-12'},
				h(Player, {player:window.GAME.right})
			)
		)
	}
}

class Game extends Component {
	render(){
		return h('div',undefined,
			h('div',{class:'h5 text-center'}, window.CONFIG.title),
			h(Stats, {}),
			h(Arena, {})
		)
	}
}

class DeckBuilderModal extends Modal {
	increment(){
		const id = this.props.card.id
		this.props.mine[id] = this.props.mine[id] ? this.props.mine[id]+1 : 1
		this.props.refresh()
	}
	decrement(){
		const id = this.props.card.id
		this.props.mine[id] = this.props.mine[id] ? Math.max(this.props.mine[id]-1,0) : 0
		this.props.refresh()
	}
	content(){
		return h('div',undefined,
			h('div',{class:'columns'},
				h('div',{class:'col-6 col-mx-auto'},
					h('div',{class:'columns'},
						h('div',{class:'col-1'},
							h('button',{class:'btn',onClick:e => this.decrement()},
								h('i',{class:'icon icon-minus'})
							)
						),
						h('div',{class:'col-10'},
							h('label',{class:'form-label'},this.props.mine[this.props.card.id] || 0)
						),
						h('div',{class:'col-1'},
							h('button',{class:'btn',onClick:e => this.increment()},
								h('i',{class:'icon icon-plus'})
							)
						)
					)
				)
			),
			h('img',{class:'img-responsive d-inline-flex',src:this.props.card.imageUrl})
		)
	}
	footer(){
		return h(window.DeckBuilderModalFooter,{card:this.props.card})
	}
}

class DeckBuilder extends Component {
	componentWillMount(){
		this.state.results = []
		this.state.mine = {}
		this.state.card = {}
		this.state.showingMine = false
	}
	download(){
		if(!this.state.showingMine){
			this.setState({showingMine:true})
		}else if(confirm('really download?')){
			const deckName = prompt('name your deck')
			Object.keys(this.state.mine).forEach(k => {
				if(!this.state.mine[k]){
					delete this.state.mine[k]
				}
			})
			download(JSON.stringify(this.state.mine),deckName+'.json','application/json')
		}
	}
	upload(e){
		const reader = new FileReader()
		reader.onload = () => {
			this.setState({mine:JSON.parse(reader.result),showingMine:true})
		}
		reader.readAsText(e.target.files[0])
	}
	render(){
		const refresh = state => this.setState(state || this.state)
		const results = (!this.state.showingMine ? this.state.results : DATA.filter(c => this.state.mine[c.id]))
		return h('div',undefined,
			h('div',{class:'columns'},
				h('div',{class:'col-4 col-mx-auto'},
					h('button',{class:'btn',onClick:e => this.props.refresh({m:undefined})},
						h('i',{class:'icon icon-back'})
					),
					h('button',{class:`btn${this.state.showingMine ? ' btn-primary' : ''}`,onClick:e => this.download()},
						h('i',{class:'icon icon-download'})
					),
					h('button',{class:'btn',onClick:e => document.getElementById('uploadButton').click()},
						h('i',{class:'icon icon-upload'}),
						h('input',{type:'file',id:'uploadButton',hidden:true,onInput:e => this.upload(e)})
					)
				)
			),
			h(window.DeckBuilderSearch,{
				refresh:refresh,
				showingMine:this.state.showingMine
			}),
			h('div',{class:'divider','data-content':`Found ${results.length} results`}),
			h('div',{class:'columns'},
				results.map(c => h('div',{class:'column col-4 text-center',onClick:e => refresh({card:c,showDeckBuilderModal:true})},
					h('img',{class:'img-responsive d-inline-flex',src:c.imageUrl})
				))
			),
			h(DeckBuilderModal,{
				id:'deck-builder-modal',
				show:this.state.showDeckBuilderModal,
				close:() => refresh({showDeckBuilderModal:false}),
				title:this.state.card.name,
				card:this.state.card,
				mine:this.state.mine,
				refresh:refresh
			})
		)
	}
}

const SCREENS = [
	{name:'Deck Builder',component:DeckBuilder},
	{name:'New Game',component:Game}
]

class Container extends Component {
	render(){
		return h('div',{class:'container text-center'},
			this.state.m ? h(this.state.m.component,{refresh:state => this.setState(state || this.state)}) : SCREENS.map(m => h('div',{class:'columns'},
				h('div',{class:'col-10 col-mx-auto'},
					h('button',{class:'btn mt-2',style:'width:100%',onClick:e => this.setState({m})},m.name)
				)				
			))
		)
	}
}

loadScript('data', false, () => {
	window.GAME = {
		left:{
			name:'L',
			score:0,
			hand:[],
			deck:[],
			active:[]
		},
		right:{
			name:'R',
			score:0,
			hand:[],
			deck:[],
			active:[]
		}
	}
	loadScript('index', true, () => {	
		render(h(Container,{}), document.body)
	})
})