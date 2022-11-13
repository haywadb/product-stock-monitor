const axios = require("axios");
const axiosRetry = require("axios-retry");
const cheerio = require("cheerio");
const { promisify } = require("util");
const { fail } = require("assert");

const sleep = promisify(setTimeout);

//Edit Monitor Delay
const monitorDelay = 100;

//Enter Product SKU's
const SKU_ID_ARRAY = [
  "15166285", //3060ti FE
  "16489413", //PS5 Digital
];
//

axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});

const grabProduct = async (SKU_ID, title, image, price, url) => {
  await axios
    .get(`https://www.bestbuy.ca/en-ca/product/${SKU_ID}`)
    .then((response) => {
      const $ = cheerio.load(response.data);
      title = $("h1").text();
      image = $(
        "div.slick-slide.slick-active.slick-current > div > div > div > div > div > img"
      ).attr("src");
      price = $("div.pricingContainer_9GyCd > div > span > span").text();
      url = response.request.res.responseUrl;
    })
    .catch((error) => {
      console.log(error.response.status + " | Product");
    });

  return {
    title,
    image,
    price,
    url,
  };
};

const checkStock = async (SKU_ID) => {
  let previousStatus;
  let productInfo;
  let monitorState;
  let productState = true;

  while (productState == true) {
    productInfo = await grabProduct(SKU_ID);

    if (productInfo.title !== undefined) {
      monitorState = true;
      productState = false;
    } else {
      await sleep(5000);
    }
  }

  while (monitorState === true) {
    await axios
      .get(
        `https://www.bestbuy.ca/ecomm-api/availability/products?accept=application%2Fvnd.bestbuy.standardproduct.v1%2Bjson&accept-language=en-CA&locations=925%7C223%7C959%7C613%7C937%7C943%7C965%7C956%7C237%7C931%7C985%7C62%7C977%7C927%7C203%7C200%7C617%7C949%7C932%7C57%7C938&postalCode=L1T&skus=${SKU_ID}`
      )
      .then((response) => {
        let status = response.data.availabilities[0].shipping.status;
        let quantity = response.data.availabilities[0].shipping.quantityRemaining;

        if (
          previousStatus !== undefined &&
          previousStatus !== status &&
          status !== "Unknown"
        ) {
          discord.bbcaWebhook(
            productInfo.title,
            productInfo.url,
            productInfo.image,
            productInfo.price,
            status,
            quantity
          );
        } else if (previousStatus == undefined || previousStatus == status) {
          console.log(
            "[" + quantity + "] " + status + " | " + productInfo.title
          );
          //discord.bbcaWebhook(productInfo.title, productInfo.url, productInfo.image, productInfo.price, status, quantity);
        }
        previousStatus = status;
      })
      .catch((error) => {
        console.log(error.response.status + " | API");
      });
    await sleep(monitorDelay);
  }
};

for (i = 0; i < SKU_ID_ARRAY.length; i++) {
  checkStock(SKU_ID_ARRAY[i]);
}
