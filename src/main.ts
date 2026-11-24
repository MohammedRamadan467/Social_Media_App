import dns from "dns";
dns.setServers(["8.8.4.4"]);


import express from 'express';
import { authenticationController, postController, userController } from './modules';
import { globalErrorHandling } from './middleware'
import { ORIGINS, PORT } from './config';
import { bootstarpDB } from './DB/connection.db';
import cors from 'cors'
import {promisify} from 'node:util'
import {pipeline} from 'node:stream'
import { cloudService} from "./common/service";
const s3ResponsePipe = promisify(pipeline)
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


app.all("/uploads/preSigned/*path", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   const Key =( req.params.path as string[]).join("/")
   const {download = 'false' , filename = (req.params.path as string[]).pop()} = req.query as {download?: 'true' | 'false',filename?: string};
   const url = await cloudService.createPreSignedFetchAssetLink({Key , download , filename})
   return res.status(200).json({ message: "Done" , url });

})



app.all("/uploads/*path", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   const Key =( req.params.path as string[]).join("/")
   const {download = 'false' , filename = (req.params.path as string[]).pop()} = req.query as {download?: 'true' | 'false',filename?: string};
   const {Body} = await cloudService.getAsset({Key})
   res.set("Cross-Origin-Resource-Policy", "cross-origin")

   if (download == 'true') {
    res.setHeader("Content-Disposition",`attachment; filename="${filename}"`); // only apply it for download
  }

   return await s3ResponsePipe(Body as NodeJS.ReadableStream , res)
});


// app.post("/send-notification", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
//    const {token} = req.body.token
//    console.log({token});
//    await notificationService.sendNotification({
//       token,
//       notification:{
//          title:"teset 3000000",
//          body:"momomomomomo"
//       }
//    })
//    return res.status(200).json({ message: "Done" });
// });

app.all("/", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
   return res.status(200).json({ message: "Done" });
});


app.use("/auth", authenticationController);
app.use("/user", userController);
app.use("/post", postController);
// app.use("/comment", commentController);


app.use(globalErrorHandling);
