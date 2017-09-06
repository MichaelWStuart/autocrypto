import {} from 'dotenv/config';
import Yobit from 'yobit';

const publicClient = new Yobit();
const privateClient = new Yobit(process.env.API_KEY, process.env.API_SECRET);

const MY_COIN = 'nlc2_btc';
const INTERVAL = 1000 * 3;
const SELL_PRICE = 0.00009;
const BUY_PRICE = 0.00007;

let market = 'sell_market';

const trade = (quantity, currentPrice) => {
  let mode;
  yobit.addTrade((err, data) => {
    if (err) throw new Error(err);
    if (market === 'sell_market') {
      mode = 'SOLD';
      market = 'buy_market';
    } else {
      mode = 'PURCHASED';
      market = 'sell_market'
    }
    console.log(`${mode} ${quantity} on ${new Date()}`);
  }, MY_COIN, market, quantity, currentPrice);
}

const examineFunds = callback =>
  privateClient.getInfo((err, data) => {
    if (err) throw new Error(err);
    callback(data.return.funds)
  })

const makeMoney = currentPrice => {
  let quantity;
  if ((market === 'sell_market') && (currentPrice > SELL_PRICE))
    examineFunds(funds => quantity = funds.nlc2);
  if ((market === 'buy_market') && (currentPrice < BUY_PRICE))
    examineFunds(funds => quantity = (funds.btc / currentPrice) - .1);
  if (quantity)
    trade(quantity, currentPrice);
}

setInterval(() => {
  console.log('*tick*')
  publicClient.getTicker((err, coin) => {
    if (err) throw new Error(err);
    else makeMoney(coin[MY_COIN].last);
  }, MY_COIN);
}, INTERVAL);
