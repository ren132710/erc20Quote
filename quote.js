const rank = 50
let geckoTokens = []
let oneInchTokens = []
let topERC20Tokens = []
let tickers = {}
//TODO: #1 quote variable seems receives fetch response object only if type is not assigned. Not sure why
//TODO: #2 However, subsequently quote is undefined when called by the displayQuoteInfo()
//TODO: although works fine from the browser console.log()
//TODO: See screenshot
//let quote = {}
let quote

/*
TODO: #3 How to get API and Bootstrap functions to run sequentially after the document loads?
TODO: I tried window.load and cannot get these function to successfully populate the global variables

TODO: #4 Testing. Currently, I am pasting each function manually, sequentially into the browser console to test.
TODO: Very tedious
TODO: I want to try a javascript test runner. Which test runner is recommended?
TODO: I am looking here: https://2020.stateofjs.com/en-US/technologies/testing/

These api and bootstrap functions need to fire after the initial page load:
fetchGeckoTokens()
fetchOneInchTokens()
generateTopERC20Tokens()
generateTickers()
populateTickerLists()
setDefaultTickers()
displayDefaultQuote()
*/

//TODO: How to make the bootstrap functions successfully on page load?
//TODO: chain the bootstrap functions in some way using async await??
// window.onload = function () {
//   console.log('page is fully loaded')
//   fetchGeckoTokens()
//   fetchOneInchTokens()
//   generateTopERC20Tokens()
//   generateTickers()
//   populateTickerLists()
//   setDefaultTickers()
//   displayDefaultQuote()
// }

/*
 * API Calls
 */

async function fetchGeckoTokens() {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${rank}&page=1`
    )
    const tokens = await response.json()
    geckoTokens = tokens

    //put tokens in PromiseResult for debugging
    return tokens
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

    //put tokenList in PromiseResult for debugging
    return tokenList
  } catch (e) {
    console.log(`error: ${e}`)
  }
}

/*
 * Defaults for testing
 * fromTokenAddress : "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" //ETH
 * toTokenAddress : "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" //USDC
 * fromCurrencyUnit : "100000000000000000"
 * fetchQuote('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '100000000000000000')
 */

async function fetchQuote(fromTokenAddress, toTokenAddress, fromCurrencyUnit) {
  try {
    const response = await fetch(
      `https://api.1inch.io/v4.0/1/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${fromCurrencyUnit}`
    )
    const quoteObj = await response.json()
    quote = quoteObj

    //put quoteObj in PromiseResult for debugging
    return quoteObj
  } catch (e) {
    console.log(`error: ${e}`)
  }
}

/*
 * Page Bootstrap Functions
 */

function generateTopERC20Tokens() {
  let arr = []

  //cool! destructuring works! :-)
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
  let options = tickers.map((ticker) => {
    return `<option value='${ticker}'>${ticker}</option>`
  })
  /**
   * TODO: consider putting the address in the value attribute so it's there already for getQuote()
   * TODO: Consider adding token name to the dropdown innerText
   * const options = topERC20Tokens.map(token => {
   *   return `<option value='${token.address}'>${token.name} (${token.symbol})</option>`
   *  })
   */

  const optionsList = options.join('')
  fromTicker.innerHTML = optionsList
  toTicker.innerHTML = optionsList
  return
}

/*
 * Let's present a default quote, so
 * set ETH as the default fromTicker
 * set USDC as the default to toTicker
 */

function setDefaultTickers() {
  const fromTickerDefault = document.querySelector(
    "#fromTicker > [value = 'ETH']"
  )
  //empty '' sets the attribute to true
  fromTickerDefault.setAttribute('selected', '')

  const toTickerDefault = document.querySelector("#toTicker > [value = 'USDC']")
  toTickerDefault.setAttribute('selected', '')
}

function displayDefaultQuote() {
  getQuote()
  return
}

/*
 * Quote Functions
 */

function getQuote() {
  let isQuoteSuccessful = false
  let tickers = getTickerSelection()
  let fromTokenAddress = getTokenAddress(tickers.fromTicker).toString()
  console.log(fromTokenAddress)
  let fromCurrencyUnit = getFromCurrencyUnit(tickers.fromTicker).toString()
  console.log(fromCurrencyUnit)
  let toTokenAddress = getTokenAddress(tickers.toTicker).toString()
  console.log(toTokenAddress)
  //let response = fetchQuote(fromTokenAddress, toTokenAddress, fromCurrencyUnit)
  fetchQuote(fromTokenAddress, toTokenAddress, fromCurrencyUnit)
  // console.log(response)
  // quote = response
  //displayQuoteInfo(quote)
  displayQuoteInfo()

  isQuoteSuccessful = true
  return isQuoteSuccessful
}

function getTickerSelection() {
  let from = document.querySelector('#fromTicker').value
  let to = document.querySelector('#toTicker').value
  return {
    fromTicker: from,
    toTicker: to,
  }
}

function getTokenAddress(ticker) {
  const foundToken = topERC20Tokens.find((item) => {
    return item.symbol === ticker
  })
  return foundToken.address
}

function getFromCurrencyUnit(ticker) {
  const foundToken = topERC20Tokens.find((item) => {
    return item.symbol === ticker
  })
  let unit = 1
  let decimals = foundToken.decimals
  let fromCurrencyUnit = zeroPad(unit, decimals)
  return fromCurrencyUnit
}

function displayQuoteInfo() {
  const spanFromLabel = document.querySelector('#fromLabel')
  const spanToTokenAmount = document.querySelector('#toTokenAmount')
  const spanToLabel = document.querySelector('#toLabel')
  const spanFromTokenAmount = document.querySelector('#fromTokenAmount')
  const spanEstimatedGas = document.querySelector('#estimatedGas')

  //TODO: Fails here ****************
  //TODO: quote returns 'undefined', however console.log(quote) in the browser DOES return the quote object??
  console.log(quote)
  spanFromLabel.innerText = `1 ${quote.fromToken.symbol} costs approximately`
  spanToTokenAmount.innerText = `${quote.toTokenAmount} ${quote.toToken.symbol}`

  spanToLabel.innerText = `1 ${quote.toToken.symbol} costs approximately`

  //TODO: Let's see if doing math on a string will fail
  spanFromTokenAmount.innerText = `${1 / quote.toTokenAmount} ${
    quote.fromToken.symbol
  }`

  spanEstimatedGas.innerText = `${quote.estimatedGas} GWEI`
}

function zeroPad(num, decimals) {
  return num.toString().padEnd(decimals + 1, '0')
}
