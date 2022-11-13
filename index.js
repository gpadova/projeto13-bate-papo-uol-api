import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";
import dotenv from "dotenv";
import dayjs from "dayjs";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const participantsSchema = joi.object({
  name: joi.string().required(),
  lastStatus: joi.string(),
});

const messagesSchema = joi.object({
  to: joi.string().required(),
  text: joi.string().required(),
  type: joi.string().valid("message", "private_message"),
});

//criar o gitignore

const mongoClient = new MongoClient("mongodb://localhost:27017"); // botar depois o .env nessa variavel
let db;
await mongoClient.connect(() => {
  db = mongoClient.db("chat_uol");
});

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  try {
    const user = { name: name };
    const validation = participantsSchema.validate(user, { abortEarly: false });

    const validateNameUser = await db.collection("usuarios").findOne({ name });

    if (validateNameUser) {
      res.sendStatus(409);
      return;
    }
    if (validation.error) {
      const erros = validation.error.details.map((detail) => detail.message);
      res.status(422).send(erros);
      return;
    }

    await db
      .collection("usuarios")
      .insertOne({ name: name, lastStatus: Date.now() });

    res.sendStatus(201);
  } catch (error) {}
});

app.get("/participants", async (req, res) => {
  try {
    const usersOnline = await db.collection("usuarios").find().toArray();
    const listOfOnlineUsers = usersOnline.map((i) => i.name);
    res.send(listOfOnlineUsers);
  } catch (error) {
    res.sendStatus(404);
  }
});

app.post("/messages", async (req, res) => {
  const { to, text, type } = req.body;
  const mensagemTotal = req.body;
  const { user } = req.headers;

  const validateSchema = messagesSchema.validate(mensagemTotal, {
    abortEarly: false,
  });

  if (validateSchema.error) {
    const errosEncontrados = validateSchema.error.details.map(
      (detail) => detail.message
    );
    res.status(422).send(errosEncontrados);
    return;
  }

  try {
    await db.collection("messages").insertOne({
      from: user,
      to: to,
      text: text,
      type: type,
      time: dayjs(Date.now()).format("HH:mm:ss"),
    });
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get("/messages", async (req, res) => {
  const {limit} = req.query;
  const usuario = req.headers.user;

  try {
    const mensagens = await db
      .collection("messages")
      .find({ $or: [{ to: "Todos" }, { to: usuario }] }).toArray();

    const mensagensEnviar = mensagens.slice(0, limit)
    console.log(mensagensEnviar)
    res.send(mensagens);
  } catch (error) {
    console.log(error);
  }
});

app.post("status", async (req, res) => {
  const user = req.header.user;

  try {
    const verificaSeEstaNaLista = await db
      .collection("usuarios")
      .findOne({ name: user });
    if (!verificaSeEstaNaLista) {
      res.sendStatus(404);
      return;
    }
    await db
      .collection("usuarios")
      .updateOne({ name: user }, $set{ name: user, lastStatus: Date.now() });
  } catch (error) {
    console.log(error);
  }
});

async function verificaInatividade() {
  const dbUsuarios = db.collection("usuarios")

  const listaUsuarios = await dbUsuarios.find().toArray()

  listaUsuarios.map(part =>{

    if(dayjs().unix() - days.js(part.lastStatus) >10)
     await db.colection("messages").insertOne({"from": del.name,"to": "Todos", text: "sai da sala", type: "status", time: dayjs.js().format("HH:MM:ss")} )
     await dbUsuarios.deleteOne({name: part.name})}
    )

}

setInterval(verificaInatividade, 15000);

app.listen(5000);
