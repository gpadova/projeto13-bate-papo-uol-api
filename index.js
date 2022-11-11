import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodd";
import joi from "joi";
import dotenv from "dotenv";
import * as dayjs from "dayjs";
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
  type: joi.string().valid("message", "private_message"),
});

//criar o gitignore

const app = express();
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

    const validateNameUser = db
      .collection("/particiapants")
      .findOne({ name: name });

    if (!validateNameUser) {
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

    res.send(201);
  } catch (error) {}
});

app.get("/participants", async (req, res) => {
  try {
    const usersOnline = await db.collection("usarios").find().toArray();
    const listOfOnlineUsers = usersOnline.forEach((i) => i.name);
    res.send(listOfOnlineUsers);
  } catch (error) {
    res.sendStatus(404);
  }
});

app.post("/messages", async (req, res) => {
  const { to, text, type } = req.body;
  const mensagemTotal = req.body;
  const from = req.header.User;

  const validateSchema = messagesSchema.validate(mensagemTotal, {
    abortEarly: false,
  });

  if (validateSchema.error) {
    const errosEncontrados = validation.error.details.map(
      (detail) => detail.message
    );
    res.status(422).send(errosEncontrados);
    return;
  }

  try {
    await db.collection("messages").insertOne({
      to: to,
      text: text,
      type: type,
      time: dayjs().format("HH:mm:ss"),
    });
    res.send(201);
  } catch (error) {
    console.log(error);
    res.send(401);
  }
});

app.get("/messages", async (req, res) => {
  const limite = req.query.limit;
  const user = req.headers.User;

  try {
    const mensagens = await db
      .collection("messages")
      .find({ $or: [{ to: "Todos" }, { to: user }] });
    const mensagensEnviar = mensagens.slice(-limite).forEach();
    res.send(mensagensEnviar);
  } catch (error) {
    console.log(error);
  }
});

app.post("status", async (req, res) => {
  const user = req.header.User;

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
  
  try{const listaUsuarios = await dbUsuarios.find().toArray()
  const usuariosDeletados = listaUsuarios.filter( user => Date.now() - user.lastStatus >=10000)
  await db.colection("messages").insertMany(usuariosDeletados.forEach( (del) => {"from": del.name,"to": "Todos", text: "sai da sala", type: "status", time: Date.now()} ))
  await dbUsuarios.deleteMany(usuariosDeletados)}
  catch(error){
    console.log(error)
  }
}

setInterval(verificaInatividade, 15000);

app.listen(5000);
