const schema = require("./dataBase/schema");
const id = require("node-machine-id");
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ex = require('process');

const main = require("../../../indexArray");

let logged = false;

const { encrypt } = require("./dataBase/cryptor")

let token;

class sending {
    constructor() {
    }

    start() {
        this.isAllExists = false;
        this.username = null;
        this.password = null;
        this.hwid = id.machineIdSync();

        this.hwidExists = false;
        this.usernameExists = false;
        this.passwordExists = false;

        this.token = "";
        this.chatId = NaN;

        this.login = false;

        this.readHwid();

        this.get();
    }

    get() {
        setTimeout(() => {
            if (!this.login) {
                this.exit("Вы не успели войти в аккаунт.");
            }
        }, 30*1000);

        rl.question("Введите имя пользователя:\n", (username) => {
            this.username = username;
            setTimeout(() => {
                this.readUsername();
            }, 1000);
            rl.question("Введите пароль пользователя:\n", (password) => {
                this.password = encrypt(password);
                setTimeout(() => {
                    this.readPassword();
                }, 3000);
                setTimeout(() => {
                    this.continue();
                }, 4000);
            })
        })
    }

    readHwid() {
        schema.findOne({hwid: this.hwid})
            .then((res) => {
            this.hwidExists = res != null && res.hwid === this.hwid;
        });
    }

    readPassword() {
        schema.findOne({password: this.password})
            .then((res) => {
                this.passwordExists = res != null && res.password === this.password;
            });
    }

    readUsername() {
        schema.findOne({username: this.username})
          .then((res) => {
            this.usernameExists = res!= null && res.username === this.username;

              if (this.usernameExists) {
                  this.token = res.token;
                  this.chatId = parseInt(res.chatId);
              }
        });
    }

    continue() {
        this.isAllExists = this.hwidExists && this.usernameExists && this.passwordExists;

        if (!this.isAllExists) {
            // console.log("Что-то из данных не совпадает, попробуйте еще раз");
            this.exit("Что-то из данных не совпадает, попробуйте еще раз");
        } else {
            this.login = true;
            logged = true;
            console.clear();
            console.log("Все данные совпадают, продолжаю...");
            main.run();
            rl.close();
        }
    }

    exit(reason) {
        console.log(reason);
        ex.exit(reason.length);
        throw new Error(reason);
    }
}

module.exports = sending;