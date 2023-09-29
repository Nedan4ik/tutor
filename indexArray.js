const bot = require('./util/bot');
const telegram = require("./util/telegram");
const crypto = require("crypto");
const config = require("./config.json");
const { decrypt } = require("./util/checks/data/dataBase/cryptor");

const connectDB = require('./util/checks/data/dataBase/connection');
const send = require("./util/checks/data/dataBase/connection");

const bots = [123123];
const botsMap = {};
let server;
connectDB.connection.connectDB();

switch (config.autoJoin.settings.server) {
    case 1:
        server = 30;
        break
    case 2:
        server = 32;
        break
    case 3:
        server = 34;
        break
    default:
        server = "Not valid"
        break
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 25 >> c / 3).toString(36)
    );
}

const run = () => {
    const tok = send.send;
    const tg = new telegram(decrypt(tok.token), tok.chatId);
    tg.setup();

    tg.send("Бот запущен!");
    tg.getTelegram().on("message", msg => {
        msg = msg.text;

        if (msg === "Новый бот" || msg === "новый бот") {
            const client = new bot(`${config.prefix}${bots.length}`, uuidv4());
            const botIndex = bots.length;
            bots.push(Math.floor(Math.random() * 10000));
            client.setup(tg);
            botsMap[botIndex] = client;

            client.getBot().on("message", async jsonMsg => {
                const msg = jsonMsg.toString();
                if (client.chatEnabled)
                    tg.send(client.getUsername() + ": " + msg);

                const message = /AngelGuard » Вы ввели капчу неправильно. У вас (\d+) попытки!/.exec(msg);

                if (msg === "AngelGuard » Введите капчу с картинки в чат" || message)
                    client.solveMap(tg);

                if (msg.includes("AngelAuth » Войдите в игру ↝ /L <Пароль>"))
                    client.send(`/l ${config.password}`);

                if (msg.includes("AngelAuth » Придумай пароль и зарегистрируй аккаунт"))
                    client.send(`/reg ${config.password} ${config.password}`);

                if (msg.includes("Вы были подключены к лобби!"))
                    if (config.autoJoin.enabled)
                        await client.autoJoin(server, config.autoJoin.settings.disableChat, tg);
            });

            client.getBot().on("kicked", reason => {
                tg.send(client.getUsername() + ": Bot has been kicked: " + reason);

                const bot = botsMap[botIndex];

                if (bot && bot.getUniqueId() === client.getUniqueId()) {
                    bots.splice(botIndex);
                    delete botsMap[botIndex];
                }
            });

            client.getBot().on("error", err => {
                tg.send(client.getUsername() + ": Bot-error: " + err.message);
            })

            client.getBot().on("end", reason => {
                tg.send(client.getUsername() + ": Bot has been ended: " + reason);

                const bot = botsMap[botIndex];

                if (bot && bot.getUniqueId() === client.getUniqueId()) {
                    bots.splice(botIndex);
                    delete botsMap[botIndex];
                }
            });

            tg.getTelegram().on("message", message => {
                message = message.text;

                const windowMatch = /(\d+) Окно клик (\d+)/i.exec(message);
                const rClickMatch = /(\d+) Пкм/i.exec(message);
                const chatMatch = /(\d+) Чат (.+)/i.exec(message);
                const chatEnableMatch = /(\d+) Чат (вкл|выкл)/i.exec(message);
                const deleteMatch = /(\d+) Удалить/i.exec(message);

                const allChatMatch = /Все Чат (.+)/i.exec(message);
                const allMatchDelete = /Все Удалить/i.exec(message);
                const allChatEnableMatch = /Все Чат (вкл|выкл)/i.exec(message);
                const allRClickMatch = /Все Пкм/i.exec(message);

                if (allChatEnableMatch) {
                    const enableCommand = allChatEnableMatch[1].toLowerCase();

                    for (let i = 1; i < bots.length; i++)
                        if (enableCommand === "вкл" || enableCommand === "выкл")
                            if (botsMap[i].getUniqueId() === client.getUniqueId())
                                botsMap[i].setChat(enableCommand === "вкл")
                }


                if (allRClickMatch) {
                    for (let i = 1; i < bots.length; i++)
                        if (botsMap[i].getUniqueId() === client.getUniqueId())
                            botsMap[i].rightClick();
                }

                if (allChatMatch) {
                    for (let i = 1; i < bots.length; i++)
                        if (botsMap[i].getUniqueId() === client.getUniqueId())
                            if (isValid(allChatMatch[1]))
                                botsMap[i].send(allChatMatch[1]);
                }

                if (allMatchDelete) {
                    for (let i = 1; i < bots.length; i++) {
                        if (botsMap[i].getUniqueId() === client.getUniqueId()) {
                            botsMap[i].disconnect();
                            bots.slice(i);
                            delete botsMap[i];
                        }
                    }
                }

                if (chatMatch) {
                    const bIndex = parseInt(chatMatch[1]);
                    const message = chatMatch[2];

                    const bot = botsMap[bIndex];

                    if (bot && bot.getUniqueId() === client.getUniqueId() && isValid(message)) {
                        bot.send(message);
                    }
                }

                function isValid(message) {
                    return message !== "выкл" && message !== "вкл" && message !== "Выкл" && message !== "Вкл";
                }

                if (deleteMatch) {
                    const bIndex = parseInt(deleteMatch[1]);

                    const bot = botsMap[bIndex];

                    if (bot && bot.getUniqueId() === client.getUniqueId()) {
                        bot.disconnect();
                        bots.splice(bIndex, 1);
                        tg.send("Бот с индексом " + bIndex + " успешно удалён!")
                        delete botsMap[bIndex];
                    }
                }

                if (chatEnableMatch) {
                    const bIndex = parseInt(chatEnableMatch[1]);
                    const enableCommand = chatEnableMatch[2].toLowerCase();

                    const bot = botsMap[bIndex];

                    if (bot && bot.getUniqueId() === client.getUniqueId()) {
                        if (enableCommand === "вкл" || enableCommand === "выкл") {
                            bot.setChat(enableCommand === "вкл", tg);
                        }
                    }
                }

                if (rClickMatch) {
                    const bIndex = parseInt(rClickMatch[1]);

                    const bot = botsMap[bIndex];

                    if (bot && bot.getUniqueId() === client.getUniqueId()) {
                        bot.rightClick();
                    }
                }

                if (windowMatch) {
                    const bIndex = parseInt(windowMatch[1]);
                    const slot = parseInt(windowMatch[2]);

                    const bot = botsMap[bIndex];
                    if (bot && bot.getUniqueId() === client.getUniqueId()) {
                        bot.windowClick(slot);
                    }
                }
            })
        }
    })
}

module.exports.run = run;