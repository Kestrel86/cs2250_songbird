const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  entryDate: { type: Date, default: Date.now },
});
const supportSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  donation: { type: String, required: true },
  entryDate: { type: Date, default: Date.now },
});

const Users = mongoose.model("Users", userSchema, "users");
const Support = mongoose.model("Support", supportSchema, "support");
const mySchemas = { Users: Users, Support: Support };

module.exports = mySchemas;
