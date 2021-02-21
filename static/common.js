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

Array.prototype.shuffle = function(){
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = this[i]
        this[i] = this[j]
        this[j] = temp
    }
}

const initGame = (decks) => {
	window.GAME = {
		left:{
			name:'left',
			score:window.CONFIG.score,
			hand:[],
			deck:[],
			active:[]
		},
		right:{
			name:'right',
			score:window.CONFIG.score,
			hand:[],
			deck:[],
			active:[]
		},
		active:Math.random() > 0.5 ? 'left' : 'right',
		turn:0
	}
	Object.keys(window.GAME).filter(k => typeof window.GAME[k] === 'object').forEach((k,j) => {
		Object.keys(decks[j]).forEach(id => {
			for(let i=0 ; i < decks[j][id] ; i++){
				window.GAME[k].deck.push(Object.assign({},window.DATA.find(c => c.id === id)))
			}
		})
		window.GAME[k].deck.shuffle()
		for(let i=0 ; i < window.CONFIG.cards.hand ; i++){
			drawCard(window.GAME[k])
		}
	})
}
const moveCard = (src,dest) => src.length && dest.push(src.pop())
const drawCard = (player) => moveCard(player.deck, player.hand)
const forfeit = () => window.GAME[window.GAME.active].score = 0
const endTurn = () => {
	window.GAME.active = window.GAME.active === 'left' ? 'right' : 'left'
	drawCard(window.GAME[window.GAME.active])
	window.GAME.turn++
}

class UploadButton extends Component {
	upload(e){
		const reader = new FileReader()
		reader.onload = () => this.props.onUpload(reader.result)
		reader.readAsText(e.target.files[0])
	}
	render(){
		return h('button',{class:'btn',onClick:e => document.getElementById(this.props.id).click()},
			this.props.display || h('i',{class:'icon icon-upload'}),
			h('input',{type:'file',id:this.props.id,hidden:true,onInput:e => this.upload(e)})
		)
	}
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

class Player extends Component {
	render(){
		return h('div',{class:'text-center'},
			h('div',{class:`divider mb-2 ${window.GAME.active === this.props.player.name ? 'text-bold' : ''}`,'data-content':`${this.props.player.name} (${this.props.player.score})`}),
			h('div',{class:'columns'},
				h('div',{class:'column col-2'},
					h('div',{class:'text-center mb-1'},
						h('span',{class:'chip'},`Deck: ${this.props.player.deck.length}`)
					),
					h('div',{class:'text-center'},
						h('button',{class:'btn',onClick:e => this.setState({showHandModal:true})},`Hand: ${this.props.player.hand.length}`)
					)
				),
				h('div',{class:'column col-10'},
					this.props.player.active.filter(c => !!c).map(c => h('div',{class:'container'},
						h('img',{class:'img-responsive d-inline-flex',src:c.imageUrl})
					))
				)
			),
			h(window.HandModal,Object.assign({
				id:'hand-modal-'+this.props.player.name,
				show:this.state.showHandModal,
				close:() => this.setState({showHandModal:false})
			},this.props))
		)
	}
}

class Game extends Component {
	forfeit(e){
		if(confirm('really forfeit?')){
			forfeit()
			this.props.refresh({m:{component:GameOver}})
		}
	}
	endTurn(e){
		if(confirm('really end turn?')){
			endTurn()
			this.setState(this.state)
		}
	}
	render(){
		return h('div',undefined,
			h('div',{class:'h5 text-center'}, window.CONFIG.title),
			h('div',{class:'columns'},
				h('div',{class:'column col-6 col-mx-auto text-center'},
					h('button',{class:'btn',onClick:e => this.forfeit(e)},'Forfeit'),
					h('span',{class:'ml-1 mr-1'},window.GAME.turn),
					h('button',{class:'btn',onClick:e => this.endTurn(e)},'End Turn')
				)
			),
			h('div',{class:'columns'},
				h('div',{class:'column col-6 col-sm-12'},
					h(Player, Object.assign({player:window.GAME.left},this.props))
				),
				h('div',{class:'column col-6 col-sm-12'},
					h(Player, Object.assign({player:window.GAME.right},this.props))
				)
			)
		)
	}
}

class GameMenu extends Component {
	componentWillMount(){
		this.state.players = 2
		this.state.decks = []
	}
	onUpload(deck,i){
		this.state.decks[i] = JSON.parse(deck)
		this.setState(this.state)
	}
	start(e){
		initGame(this.state.decks)
		this.props.refresh({m:{component:Game}})
	}
	render(){
		return h('div',undefined,
			h('div',{class:'columns'},
				Array.from({length:this.state.players}).map((t,i) => 
					h('div',{class:'column col col-sm-12 text-center'},
						h('div',{class:'h5'},`Player ${i+1} Deck`),
						this.state.decks[i] ? h('i',{class:'icon icon-check'}) : h(UploadButton,{id:`player-${i}-upload`,onUpload:result => this.onUpload(result,i)})
					)
				)
			),
			this.state.decks.length === this.state.players && h('div',{class:'btn-group-blk mt-2'},
				h('button',{class:'btn',onClick:e => this.start(e)},'Start')
			)
		)
	}
}

class GameOver extends Component {
	render(){
		return h('div',{class:'columns'},
			h('div',{class:'column col-3 text-center'},
				h('label',{class:'form-label'},`${window.GAME.left.name}: ${window.GAME.left.score}`)
			),
			h('div',{class:'column col-6 text-center'},
				h('div',{class:'h5'},`Game Over`),
				h('div',undefined,
					h('button',{class:'btn',onClick:e => this.props.refresh({m:undefined})},'Main Menu')
				)
			),
			h('div',{class:'column col-3 text-center'},
				h('label',{class:'form-label'},`${window.GAME.right.name}: ${window.GAME.right.score}`)
			)
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
					h(UploadButton,{id:'upload-button',onUpload:result => this.setState({mine:JSON.parse(result),showingMine:true})})
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
	{name:'New Game',component:GameMenu}
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
	loadScript('index', true, () => {	
		render(h(Container,{}), document.body)
	})
})