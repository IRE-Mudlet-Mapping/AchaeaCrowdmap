import Realm from "realm";
import * as fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

const app = new Realm.App({ id: "nexmap-izeal" });
const credentials = Realm.Credentials.serverApiKey(
  process.env.MONGO_API_KEY
);
await app.logIn(credentials);
const mongodb = app.currentUser.mongoClient("mongodb-atlas");
const db = mongodb.db("nexMap").collection("denizens");

const denizens = await db.find();
const denizenCount = {};
for (const entry of denizens) {
  const currentCount = denizenCount[entry.name] || 0;
  denizenCount[entry.name] = currentCount + 1;
}
const result = denizens
  .filter((entry) => denizenCount[entry.name] === 1)
  .map((entry) => {
    return { name: entry.name, loc: entry.room[0] };
  });
fs.writeFileSync("Map/denizen.json", JSON.stringify(result));
process.exit(0);
