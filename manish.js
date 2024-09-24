import express from "express";
import dotenv from 'dotenv'
import { Dbconnection } from "./Db/Db.js";
import router from "./router/UserRoute.js";
import cors from 'cors'


dotenv.config();


const app = express();
const port = process.env.PORT || 4000
app.use(express.json());
app.use(cors());
app.use(router);



app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port, ()=> {
    console.log(`Server is running on http://localhost:${port}`);
    Dbconnection();
})

