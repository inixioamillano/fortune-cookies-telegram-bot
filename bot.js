const TelegramBot = require('node-telegram-bot-api');
var pjson = require('./package.json');
const fs = require("fs");
require('dotenv').config();

console.log(`Booting up ${pjson.actualName} - v${pjson.version}`);

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

const cookiesString = fs.readFileSync('./fortunes', {encoding: 'utf8'});
const cookies = cookiesString.split('\n%\n');

console.log(`${cookies.length} cookies available`)

const commands = [
    {
        command: '/cookie',
        description: 'Get a random fortune cookie'
    },
    {
        command: '/commands',
        description: 'Get commands list'
    },
    {
        command: '/aboutfortunecookies',
        description: 'I give you basic info about me'
    }
];

if (process.env.PAYMENT_TOKEN) {
    commands.push({
        command: '/contribute',
        description: 'Contribute to this project with a small contribution'
    });
}

bot.setMyCommands(commands);

bot.onText(/\/aboutfortunecookies/, async (msg, match) => {
    let text = `${pjson.actualName}\nv${pjson.version}\n`;
        //+ `Source code <a href="${pjson.repository.url}">here</a>`;
    if (process.env.PAYMENT_TOKEN) {
        text = text + `\n\nSupport this project with /support`;
    }
    bot.sendMessage(msg.chat.id, text,
    {
        parse_mode: 'HTML'
    });
});

bot.onText(/\/cookie/, (msg, match) => {
    const index = Math.floor(Math.random()*cookies.length);
    const cookie = cookies[index];
    bot.sendMessage(msg.chat.id, `🥠 ${cookie} 🥠`)
})

bot.onText(/\/commands/, (msg, match) => {
    let text = `Available commands (v${pjson.version})\n\n`;
    commands.forEach(c => {
        text = text + `${c.command} - ${c.description}\n\n`
    })
    bot.sendMessage(msg.chat.id, text);
})

bot.onText(/\/contribute/, (msg, match) => {
    if (!process.env.PAYMENT_TOKEN) return;
    bot.sendInvoice(msg.chat.id, 'Support this project', 'Help to keep this project alive with a small contribution', pjson.actualName, process.env.PAYMENT_TOKEN, null, 'EUR', [{
        label: 'Contribution',
        amount: 100 //Cents
    }])
})

bot.on('polling_error', (e) => console.log(e))