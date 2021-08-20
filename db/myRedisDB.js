const redis = require("redis");
const { promisify } = require("util");

const client = redis.createClient();
client.on("error", console.error);

client.p_hset = promisify(client.hset).bind(client);
client.p_hgetall = promisify(client.hgetall).bind(client);
client.p_zincrby = promisify(client.zincrby).bind(client);
client.p_zrange = promisify(client.zrange).bind(client);
client.p_zrem = promisify(client.zrem).bind(client);

async function createUser(username, password, name) {
  console.log("creating user", username);
  return await client.p_hset(
    "user:" + username,
    "username",
    username,
    "password",
    password,
    "name",
    name
  );
}

async function getUser(username) {
  return await client.p_hgetall("user:" + username);
}

async function addToList(store){
  console.log("Add to edit history", store);
  
  return await client.p_zincrby("recently_edit_list", 1, store.store_location);
}


// async function editScore(store_id, addedScore){
//   console.log("Add Score");
//   try{
//     return await client.p_zincrby("recently_edit_list", addedScore, store_id);
//   }catch(err){
//     console.log("err", err);
//   }finally{
//     client.quit();
//   }
// }

async function getEditHistory(){
  console.log("Getting edit history");

  return await client.p_zrange("recently_edit_list", 0, -1);
}


// async function deleteEditHistory(store_id){
//   console.log("Deleting");
//   try{
//     return await client.p_zrem("recently_edit_list", store_id);
//   }catch(err){
//     console.log("err", err);
//   }finally{
//     client.quit();
//   }
// }

module.exports.createUser = createUser;
module.exports.getUser = getUser;
module.exports.addToList = addToList;
// module.exports.editScore = editScore;
module.exports.getEditHistory = getEditHistory;
// module.exports.deleteEditHistory = deleteEditHistory;