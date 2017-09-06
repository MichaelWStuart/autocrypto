import {} from 'dotenv/config';
import Yobit from 'yobit';

// a little patch
Yobit.prototype.addTrade = function addTrade(callback, pair, type, rate, amount) {
  this.privateRequest('Trade', { pair, type, rate, amount }, callback)
}

const publicClient = new Yobit();
const privateClient = new Yobit(process.env.API_KEY, process.env.API_SECRET);

const MY_COIN = 'nlc2_btc';
const INTERVAL = 10000;
const SELL_PRICE = 0.00009;
const BUY_PRICE = 0.00007;

let mode = 'sell';

const trade = (currentPrice, quantity) => {
  privateClient.addTrade((err, data) => {
    if (!data.success) throw new Error(data.error);
    mode = mode === 'sell' ? 'buy' : 'sell';
    console.log(`${mode} ${quantity} on ${new Date()}`);
  }, MY_COIN, mode, currentPrice, quantity);
}

const examineFunds = callback =>
  privateClient.getInfo((err, data) => {
    if (!data.success) throw new Error(data.error);
    callback(data.return.funds)
  })

const makeMoney = currentPrice => {
  let quantity;
  if ((mode === 'sell') && (currentPrice > SELL_PRICE))
    examineFunds(funds => quantity = funds.nlc2);
  if ((mode === 'buy') && (currentPrice < BUY_PRICE))
    examineFunds(funds => quantity = (funds.btc / currentPrice) - .1);
  if (quantity)
    trade(currentPrice, quantity);
}

setInterval(() => {
  publicClient.getTicker((err, coin) => {
    if (!data.success) throw new Error(data.error);
    makeMoney(coin.nlc2_btc.last);
  }, MY_COIN);
}, INTERVAL);
