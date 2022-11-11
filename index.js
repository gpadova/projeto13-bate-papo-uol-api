import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodd";
import joi from "joi";
import dotenv from "dotenv";
dotenv.config();

app.use(cors());
app.use(express.json());

const participantsSchema = joi.object({
  name: joi.string().required(),
  lastStatus: joi.string(),
});

const messagesSchema = joi.object({
  to: joi.string().required(),
  text: joi.string().required(),
  type: joi.string()
});

const app = express();
const mongoClient = new MongoClient("mongodb://localhost:27017"); // botar depois o .env nessa variavel

let db;

await mongoClient.connect();
db = mongoClient.db("chat_uol");

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  try {
    const user = {name: name}
    const validation = participantsSchema.validate(user, { abortEarly : false})

    const validateNameUser = db
      .collection("/particiapants")
      .findOne({ name: name });

    if (!validateNameUser) {
      res.sendStatus(409);
      return
    }
    if(validation.error){
        const erros = validation.error.details.map(detail => detail.message)
        res.status(422).send(erros)
    }

    await db
      .collection("usuarios")
      .insertOne({ name: name, lastStatus: Date.now() });

    res.send(201);
  } catch (error) {}
});

app.get("/participants", async (req, res) => {
  try {
    const usersOnline = await db.collection("usarios").find();
    res.send(usersOnline.forEach((i) => i.name));
  } catch (error) {
    res.sendStatus(404);
  }
});

app.post("/messages", (req, res) => {
  const { to, text, type } = req.body;
  const from = req.header.User;

  try {
  } catch (error) {}
});

app.get("/messages", (req, res) => {});

app.post("status", (req, res) => {});

function verificaInativade() {}

setInterval(verificaInatividade, 15000);

app.listen(4000);
