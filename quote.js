/*
 * DOM Handles
 */

//dropdown lists
const fromTicker = document.querySelector('#fromTicker')
const toTicker = document.querySelector('#toTicker')

//quote info box
const spanFromLabel = document.querySelector('#fromLabel')
const spanToTokenAmount = document.querySelector('#toTokenAmount')
const spanToLabel = document.querySelector('#toLabel')
const spanFromTokenAmount = document.querySelector('#fromTokenAmount')
const spanEstimatedGas = document.querySelector('#estimatedGas')

/*
 * Globals
 */

const rank = 50
const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const ETH_DECIMALS = '18'
const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const USDC_DECIMALS = '6'
let topERC20Tokens = []
let tickers = []

/*
 * Fetch
 */

async function fetchTopTickers() {
  try {
    let response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${rank}&page=1`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    let tokens = await response.json()

    //keep a record of the top tickers
    //.find() is case sensitive, 1inch symbols are upper case, so toUpperCase()
    tickers = tokens.map(({ symbol }) => symbol.toUpperCase())

    return tickers
  } catch (e) {
    console.log(`'ERROR: ' ${e}`)
  }
}

async function fetchTopTokenInfo(tickers) {
  try {
    let response = await fetch('https://api.1inch.exchange/v3.0/1/Tokens')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    let tokens = await response.json()

    //1inch JSON hierarchy requires going 2 levels deep to get the value objects
    let tokenList = Object.values(tokens.tokens)

    //keep a record of the top ERC20 tokens
    topERC20Tokens = generateTopERC20Tokens(tickers, tokenList)

    return topERC20Tokens
    //return tokenList.filter((token) => tickers.includes(token.symbol)) <--TODO: I could not get this to work
  } catch (e) {
    console.log(`'ERROR: ' ${e}`)
  }
}

function generateTopERC20Tokens(tickers, tokenList) {
  let topERC20Tokens = []

  tickers.forEach((ticker) => {
    let foundToken = tokenList.find(({ symbol }) => {
      return symbol === ticker
    })
    if (!(foundToken == null)) {
      topERC20Tokens.push(foundToken)
    }
  })
  return topERC20Tokens
}

async function fetchQuote(fromTokenAddress, toTokenAddress, fromCurrencyUnit) {
  console.log(fromTokenAddress)
  console.log(toTokenAddress)
  console.log(fromCurrencyUnit)

  try {
    const response = await fetch(
      `https://api.1inch.io/v4.0/1/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${fromCurrencyUnit}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const quote = await response.json()

    return quote
  } catch (e) {
    console.log(`error: ${e}`)
  }
}

/*
 * Page Initialization
 */

fetchTopTickers().then(fetchTopTokenInfo).then(initializePage)

function initializePage() {
  populateTickerLists()
  setDefaultTickers()
  displayDefaultQuote()
}

function populateTickerLists() {
  let options = topERC20Tokens.map((token) => {
    return `<option value='${token.decimals}-${token.address}'>${token.name} (${token.symbol})</option>`
  })

  let optionsList = options.join('')
  fromTicker.innerHTML = optionsList
  toTicker.innerHTML = optionsList
  return
}

//Set ETH and USDC as the default tickers
function setDefaultTickers() {
  const fromTickerDefault = document.querySelector(
    `#fromTicker > [value = '${ETH_DECIMALS}-${ETH_ADDRESS}']`
  )
  //empty '' sets the attribute to true
  fromTickerDefault.setAttribute('selected', '')

  const toTickerDefault = document.querySelector(
    `#toTicker > [value = '${USDC_DECIMALS}-${USDC_ADDRESS}']`
  )
  toTickerDefault.setAttribute('selected', '')
}

function displayDefaultQuote() {
  getQuote()
  return
}

/*
 * Quote Functions
 */

async function getQuote() {
  let tickers = getTickerSelection()
  let fromCurrencyUnit = getFromCurrencyUnit(tickers.fromDecimals)

  let quote = await fetchQuote(
    tickers.fromAddress,
    tickers.toAddress,
    fromCurrencyUnit
  )

  displayQuoteInfo(quote, tickers.decimalRatio)

  return quote
}

function displayQuoteInfo(quote, decimalRatio) {
  exchangeRate =
    (Number(quote.toTokenAmount) / Number(quote.fromTokenAmount)) * decimalRatio
  spanFromLabel.innerText = `1 ${quote.fromToken.symbol} costs approx.`
  spanToTokenAmount.innerText = `${exchangeRate} ${quote.toToken.symbol}`

  spanToLabel.innerText = `1 ${quote.toToken.symbol} costs approx.`
  spanFromTokenAmount.innerText = `${1 / exchangeRate} ${
    quote.fromToken.symbol
  }`

  spanEstimatedGas.innerText = `${quote.estimatedGas} GWEI??`
}

function getTickerSelection() {
  //parse the option values
  let fromToken = document.querySelector('#fromTicker').value
  let [fromDec, fromAddr] = fromToken.split('-')
  let toToken = document.querySelector('#toTicker').value
  let [toDec, toAddr] = toToken.split('-')
  let decRatio = 10 ** (fromDec - toDec)

  return {
    fromAddress: fromAddr,
    fromDecimals: fromDec,
    toAddress: toAddr,
    toDecimals: toDec,
    decimalRatio: decRatio,
  }
}

function getFromCurrencyUnit(decimals) {
  let unit = 1
  return unit.toString().padEnd(+decimals + 1, '0')
}
