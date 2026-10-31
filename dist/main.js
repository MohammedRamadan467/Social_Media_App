"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["8.8.4.4"]);
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const middleware_1 = require("./middleware");
const config_1 = require("./config");
const connection_db_1 = require("./DB/connection.db");
const user_1 = require("./modules/user");
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, connection_db_1.bootstarpDB)(app, config_1.PORT);
app.all("/", async (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.use("/auth", modules_1.authenticationController);
app.use("/user", user_1.userController);
app.use(middleware_1.globalErrorHandling);
