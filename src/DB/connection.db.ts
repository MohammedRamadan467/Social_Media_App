import express from "express";
import mongoose from "mongoose";
import { DB_URI } from "../config.js";

// problem in wifi with me


export const bootstarpDB = async (app: express.Application, port: number) => {
    try {
        await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 })
        console.log(`DB connected successfully ✅`)
        app.listen(port, () => console.log(`Example app listening on port ${port}`))
    } catch (error) {
        console.log(error)
        console.log(`Fail to connect DB ❌`)

    }
}