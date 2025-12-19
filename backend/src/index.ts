import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import chatRoutes from './routes/chat'


const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000


app.get('/', (_, res) => {
    res.json(`Running on PORT ${PORT}`)
})

app.use('/chat', chatRoutes)

app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`)
})
