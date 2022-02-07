let rank = 50
let geckoTokens = []
let oneInchTokens = []
let topERC20Tokens = []
let tickers = []

/* is there a better way to run these functions for testing as I go */
// let a = fetchGeckoTokens()
// let b = fetchOneInchTokens()
// let c = generateTopERC20Tokens()
// let d = generateTickers()
// let e = populateTickerLists()
// let f = setDefaultOptions()
// let g = getTickerSelection()

// console.log(a)
// console.log(b)
// console.log(c)
// console.log(d)
// console.log(e)
// console.log(f)
//console.log(g)

async function fetchGeckoTokens() {
	try {
		const response = await fetch(
			`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${rank}&page=1`
		)
		const tokens = await response.json()
		geckoTokens = tokens
		return
	} catch (e) {
		console.log(`error: ${e}`)
	}
}

async function fetchOneInchTokens() {
	try {
		const response = await fetch('https://api.1inch.exchange/v3.0/1/Tokens')
		const tokens = await response.json()

		//1inch JSON hierarchy requires going 2 levels deep to get the value objects
		const tokenList = Object.values(tokens.tokens)
		oneInchTokens = tokenList
		return
	} catch (e) {
		console.log(`error: ${e}`)
	}
}

function generateTopERC20Tokens() {
	let arr = []

	//hey! destructuring works! :-)
	geckoTokens.forEach(({ symbol }) => {
		//.find() is case sensitive, 1inch symbols are upper case, so toUpperCase()
		let geckoSymbolUpper = symbol.toUpperCase()

		//gotta have BTC, so substitute WBTC
		if (geckoSymbolUpper === 'BTC') {
			geckoSymbolUpper = 'WBTC'
		}

		//if 1inch matches Gecko, push to array
		const foundToken = oneInchTokens.find(({ symbol }) => {
			return symbol === geckoSymbolUpper
		})
		if (!(foundToken == null)) {
			arr.push(foundToken)
		}
	})
	topERC20Tokens = arr
	return
}

function generateTickers() {
	let arr = []
	topERC20Tokens.forEach(({ symbol }) => {
		let ticker = symbol
		arr.push(ticker)
	})
	tickers = arr
	return
}

function populateTickerLists() {
	const fromTicker = document.querySelector('#fromTicker')
	const toTicker = document.querySelector('#toTicker')
	let optionsArr = tickers.map((ticker) => {
		return `<option value='${ticker}'>${ticker}</option>`
	})
	const optionsList = optionsArr.join('')
	fromTicker.innerHTML = optionsList
	toTicker.innerHTML = optionsList
	return
}

/*
    We want to present a default quote, so
    Set ETH as default for .from-select
    Set USDC as default for .to-select
  */

function setDefaultOptions() {
	const fromTickerDefault = document.querySelector(
		"#fromTicker > [value = 'ETH']"
	)
	//empty '' sets the attribute to true
	fromTickerDefault.setAttribute('selected', '')

	const toTickerDefault = document.querySelector(
		"#toTicker > [value = 'USDC']"
	)
	toTickerDefault.setAttribute('selected', '')
}

function getTickerSelection() {
	let from = document.querySelector('#fromTicker').value
	let to = document.querySelector('#toTicker').value
	console.log('from: ' + from)
	console.log('to: ' + to)
	return [from, to]
}

function fetchTokenSwapInfo(to, from) {
	//get to address; from address
	//post api call
	//parse and store quote-response
}

function displayTokenSwapInfo(data) {
	//display quote-response to quote-info-box
}
