// RedisTimeSeries is a Redis module for efficiently storing, querying, and analyzing time-series data.
// Examples of time-series data:
// Stock prices
// IoT sensor readings
// Server metrics (CPU, memory usage)
// Website analytics (page views over time)



// Features
// Optimized storage for time-series data.
// Aggregation functions (average, sum, min, max).
// Downsampling: reduce granularity over time.
// Labels / Metadata for filtering and grouping.
// Fast queries using ranges and aggregation.

const redis = require("redis");

const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379"
});


// time series for stock - create ts, add prices over time, query the price history and get the latest price.
(async () => {
  await redisClient.connect(); 

  // time series key that will store all data points of a stock
   const stockKey = "stock:AAPL" // AAPL NASDAQ stock exchange pr apple inc ka stoch ticker symbol

   // create time series for stock
   await redisClient.sendCommand([
    "TS.CREATE",  // create redis timeseries key
    stockKey,"RETENTION",
    "86400000", // keep 1 day of data (24 × 60 × 60 × 1000ms), older data automatically deleted
    "LABELS", "symbol", "AAPL", "type", "stock" // LABELS → Metadata for the series: symbol = AAPL ,type = stock
   ])
   console.log("Time series created for AAPL");
   
   // add some stock prices
   await redisClient.sendCommand(["TS.ADD",stockKey,"*","190.7"])   // * for current timestamp
   await redisClient.sendCommand(["TS.ADD",stockKey,"*","153.2"])
   await redisClient.sendCommand(["TS.ADD",stockKey,"*","143.2"])


   // get all stock prices
   const prices = await redisClient.sendCommand(["TS.RANGE",stockKey,"-","+"]) 
    // const pricese = await redisClient.sendCommand(["TS.RANGE",stockKey,"-","+", "FILTER_BY_VALUE", "100", "200"]) 

   // TS.RANGE key fromTimestamp toTimestamp  - start of series, + end of series
   console.log("Prices",prices);   // gives timestamp of last updated and value


})();



// TS.CREATE stock:AAPL RETENTION 86400000 LABELS symbol AAPL type stock
// TS.ADD stock:AAPL * 190.7
// TS.ADD stock:AAPL * 153.2
// TS.RANGE stock:AAPL - +
// TS.GET stock:AAPL
// TS.MRANGE - + FILTER symbol=AAPL type=stock 

