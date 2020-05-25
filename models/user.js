const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  country: String,
  gender: String,
  favorites: [],
  imgName: {
    type: String,
    default: 'default-avatar'
  },
  imgPath: {
    type: String,
    default: 'https://res.cloudinary.com/dffhqdktj/image/upload/v1590075318/Wilsco/Profile_avatar_placeholder_large.png.png'
  }
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
});
const User = mongoose.model("User", userSchema);
module.exports = User;