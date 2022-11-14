const figlet = require("figlet");
const readlineSync = require('readline-sync');

console.log(figlet.textSync('PRODUCT MONITOR', {
    font: 'Slant',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
}));

let initialize = true;
while (initialize == true) {
    const menu = ['Launch', 'Notifications', 'Exit'],
        index = readlineSync.keyInSelect(menu, 'Go to:', {
            cancel: false
        });

    if (menu[index] === 'Launch') {
        let launchLoop = true;
        while (launchLoop == true) {
            const launchMenu = ['BestBuy Canada', 'ToysRUs Canada', 'Main Menu'],
                lIndex = readlineSync.keyInSelect(launchMenu, 'Go to:', {
                    cancel: false
                });
            if (launchMenu[lIndex] === 'BestBuy Canada') {

                let SKU_ID = readlineSync.question("Insert product ID's (example: 15166285, 16489413, 15723984): ");
                let monitorDelay = readlineSync.question("Insert monitor delay (recommended: 500): ");
                SKU_ID = SKU_ID.replace(/\s/g, '');
                const SKU_ID_ARRAY = SKU_ID.split(',');

                initialize = false;
                launchLoop = false;
                var bbca = require('./monitors/bestbuy-ca.js');
                for (i = 0; i < SKU_ID_ARRAY.length; i++) {
                    bbca.checkStock(SKU_ID_ARRAY[i], monitorDelay);
                }

            } else if (launchMenu[lIndex] === 'ToysRUs Canada') {

                let SKU_ID = readlineSync.question("Insert product ID's (example: E4A019FE, 347639AD): ");
                let monitorDelay = readlineSync.question("Insert monitor delay (recommended: 3500): ");
                SKU_ID = SKU_ID.replace(/\s/g, '');
                const SKU_ID_ARRAY = SKU_ID.split(',');

                initialize = false;
                launchLoop = false;
                var trusca = require('./monitors/toysrus-ca.js');
                for (i = 0; i < SKU_ID_ARRAY.length; i++) {
                    trusca.checkStock(SKU_ID_ARRAY[i], monitorDelay)
                    //await sleep(monitorDelay / SKU_ID_ARRAY.length)
                }

            } else if (launchMenu[lIndex] === 'Main Menu') {
                launchLoop = false;
            }
        }
    } else if (menu[index] === 'Notifications') {
        let notificationLoop = true;
        while (notificationLoop == true) {
            const notificationMenu = ['Discord', 'SMS', 'Main Menu'],
                nIndex = readlineSync.keyInSelect(notificationMenu, 'Go to:', {
                    cancel: false
                });
            if (notificationMenu[nIndex] === 'Discord') {

            } else if (notificationMenu[nIndex] === 'Main Menu') {
                notificationLoop = false;
            }
        }
    } else if (menu[index] === 'Exit') {
        process.exit()
    }
}