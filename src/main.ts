import dns from "dns";
dns.setServers(["8.8.4.4"]);


import express from 'express';
import { authenticationController } from './modules';
import { globalErrorHandling } from './middleware'
import { ORIGINS, PORT } from './config';
import { bootstarpDB } from './DB/connection.db';
import cors from 'cors'
import { userController } from "./modules/user";
import { HUser, UserModel } from "./DB/model";
import { AccountStatusEnum, GenderEnum, ProviderEnum } from "./common/enum";
import { UserRepository } from "./common/repository";
import { toObjectId } from "./common/utlis";
import { postController } from "./modules/post";
import { commentController } from "./modules/comment";
const app: express.Application = express();

var corsOptions = {
   origin: function (origin: string, callback: Function) {
      if (!ORIGINS.includes(origin)) {
         callback(new Error("unauthorized origin", { cause: { status: 401 } }), ORIGINS)
      } else {
         callback(null, ORIGINS)
      }
   }
}

app.use(cors(), express.json())
app.use("/assets", express.static("./assets"))
bootstarpDB(app, PORT)

app.all("/", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
   return res.status(200).json({ message: "Done" });
});


app.use("/auth", authenticationController);
app.use("/user", userController);
app.use("/post", postController);
app.use("/comment", commentController);


app.use(globalErrorHandling);
