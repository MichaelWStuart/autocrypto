import {} from 'dotenv/config';
import Yobit from 'yobit';

// a little patch
Yobit.prototype.addTrade = function addTrade(callback, pair, type, rate, amount) {
  this.privateRequest('Trade', { pair, type, rate, amount }, callback)
}

const publicClient = new Yobit();
const privateClient = new Yobit(process.env.API_KEY, process.env.API_SECRET);

const INTERVAL = 10000;
const SELL_PRICE = 0.000085;
const BUY_PRICE = 0.00007;

let mode = 'sell';

const trade = (currentPrice, quantity) => {
  privateClient.addTrade((err, data) => {
    if (!data.success) throw new Error(data.error);
    mode = mode === 'sell' ? 'buy' : 'sell';
    console.log(`${mode} ${quantity} on ${new Date()}`);
  }, 'nlc2_btc', mode, currentPrice, quantity);
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
  publicClient.getTicker((err, data) => {
    if (err) throw new Error(err);
    makeMoney(data.nlc2_btc.last);
  }, 'nlc2_btc');
}, INTERVAL);
