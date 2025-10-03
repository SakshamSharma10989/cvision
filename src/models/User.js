import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String, default: null },
  provider: { type: String, default: "credentials" },
})

const User = mongoose.models.User || mongoose.model("User", UserSchema)
export default User
