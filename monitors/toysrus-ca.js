const axios = require('axios');
const cheerio = require('cheerio');
const {promisify} = require('util');
const {fail} = require('assert');
const sleep = promisify(setTimeout);
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retryDelay: (retryCount) => {
    return retryCount * 2000;
}});

module.exports = {
    checkStock: async function(SKU_ID, monitorDelay) {

        let emptyStock = false;
        let monitorState = true;
        let retryState = 0;
    
        const productInfo = await grabTitle(SKU_ID);
    
        while (monitorState === true) {
    
            await axios.get(`https://www.toysrus.ca/en/stores-getatsvalue?pid=${SKU_ID}`)
                .then(async function(response) {
                    retryState = 0;
                    if (emptyStock == false && response.data.ats.homeDelivery !== 0) {
                        console.log('[' + response.data.ats.homeDelivery + '] ' + '| ' + productInfo.title);        
                        emptyStock = true;
                        //await sendDiscordStock(productInfo.title, productInfo.image, productInfo.price, response.data.ats.homeDelivery, productInfo.url);
                    } else if (emptyStock == true && response.data.ats.homeDelivery == 0) {
                        console.log('[' + response.data.ats.homeDelivery + '] ' + '| ' + productInfo.title);        
                        emptyStock = false;
                    } else {
                        console.log('[' + response.data.ats.homeDelivery + '] ' + '| ' + productInfo.title);                  
                    }
                })
                .catch(async function(error) {
                   // fs.writeFileSync(logfile_name, error)
                    console.log(error.response.status + ': ' + error.response.statusText);
                    await sleep(3000 * retryState++)
                });
            await sleep(monitorDelay)
        }
    }
};

async function grabTitle(SKU_ID, title, image, price, url) {

    await axios.get(`https://www.toysrus.ca/en/${SKU_ID}.html`)
        .then(function(response) {
            const stockData = response.data
            const $ = cheerio.load(stockData)
            url = response.request.res.responseUrl
            title = $('#breadcrumbs-accordion > span').text()
            image = ($('div > div > div > div > div > img').attr('src'));
            price = $('span.b-price-value.js-sales-price-value').text().trim()
        })
        .catch(function(error) {
           // console.log(error);
        });

    return {
        title,
        image,
        price,
        url
    };
}