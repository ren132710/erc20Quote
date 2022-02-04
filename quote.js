let rank = 50
let geckoTokens = []
let oneInchTokens = []
let topERC20Tokens = []

function test() {
  fetchGeckoTokens()
  fetchOneInchTokens()
  generateTopERC20Tokens()
  return
}

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
  let results = []

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
      results.push(foundToken)
    }
  })
  topERC20Tokens = results
  return
}

function populateLists() {
  //add tokens symbol and name to fromList
  //add tokens symbol and name to toList
}

function getQuote(to, from) {
  //fetch quote from 1inch
  //return result
}

function displayTokenSwapInfo(data) {
  //add listener for select onChange
  //default to ETH/USDC
  //print quote to token-swap-info
}
