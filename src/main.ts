import dns from "dns";
dns.setServers(["8.8.4.4"]);


import express from 'express';
import { authenticationController } from './modules';
import { globalErrorHandling } from './middleware'
import { PORT } from './config';
import { bootstarpDB } from './DB/connection.db';
import { sendEmail } from './common/utlis/email';
import { EmailSubjectEnum } from './common/enum';
import { userController } from "./modules/user";

const app: express.Application = express();
app.use(express.json())

bootstarpDB(app, PORT)

app.all("/", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
    return res.status(200).json({ message: "Done" });
});


app.use("/auth", authenticationController);
app.use("/user", userController);


app.use(globalErrorHandling);
