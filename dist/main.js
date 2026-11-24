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
const cors_1 = __importDefault(require("cors"));
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const service_1 = require("./common/service");
const s3ResponsePipe = (0, node_util_1.promisify)(node_stream_1.pipeline);
const app = (0, express_1.default)();
var corsOptions = {
    origin: function (origin, callback) {
        if (!config_1.ORIGINS.includes(origin)) {
            callback(new Error("unauthorized origin", { cause: { status: 401 } }), config_1.ORIGINS);
        }
        else {
            callback(null, config_1.ORIGINS);
        }
    }
};
app.use((0, cors_1.default)(), express_1.default.json());
app.use("/assets", express_1.default.static("./assets"));
(0, connection_db_1.bootstarpDB)(app, config_1.PORT);
app.all("/uploads/preSigned/*path", async (req, res, next) => {
    const Key = req.params.path.join("/");
    const { download = 'false', filename = req.params.path.pop() } = req.query;
    const url = await service_1.cloudService.createPreSignedFetchAssetLink({ Key, download, filename });
    return res.status(200).json({ message: "Done", url });
});
app.all("/uploads/*path", async (req, res, next) => {
    const Key = req.params.path.join("/");
    const { download = 'false', filename = req.params.path.pop() } = req.query;
    const { Body } = await service_1.cloudService.getAsset({ Key });
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    if (download == 'true') {
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    }
    return await s3ResponsePipe(Body, res);
});
app.all("/", async (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.use("/auth", modules_1.authenticationController);
app.use("/user", modules_1.userController);
app.use("/post", modules_1.postController);
app.use(middleware_1.globalErrorHandling);
