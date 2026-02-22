const express = require("express");
const bodyParser = require("body-parser");

const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const session = require("express-session");
const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");

// models
const User = require("./models/User.js");
// const User = new mongoose.model("User", UserSchema);

const Shop = require("./models/Shop.js");
// const Order = require("./models/Order.js");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

//------------------Middleware---------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);
// require("./passportConfig2")(passport);

// ----------CONNECT DATABASE----------------
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_ADMIN}:${process.env.MONGODB_PASSWORD}@cluster0.7myea.mongodb.net/tietDB`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Mongoose is connected");
  }
);

app.get("/login-user", function (req, res) {
  res.render("login-user");
});

app.get("/signup-user", function (req, res) {
  res.render("signup-user");
});

app.post("/signup-user", function (req, res) {
  const {
    firstName,
    lastName,
    username,
    email,
    phoneNumber,
    password,
    address,
    pincode,
  } = req.body;

  try {
    User.findOne({ username: username }, async (err, doc) => {
      if (err) throw err;
      if (doc) res.send("User Already exists");
      if (!doc) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          phoneNumber: phoneNumber,
          password: hashedPassword,
          address: address,
          pincode: pincode,
        });
        await newUser.save().then((user) => {
          console.log(user);
        });
        res.redirect("/login-user");
        res.send("User Created");
        // res.render("shops");
      }
    });
  } catch (err) {
    res.status(400), send(err);
  }
});

app.post("/login-user", (req, res, next) => {
  //   console.log("in login user");
  //   console.log(req.body);
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) {
      //   console.log(user);
      res.send("No User Exists");
    } else {
      req.logIn(user, (err) => {
        if (err) throw err;
        else {
          console.log("Successfully Authenticated " + req.user.username);
          // res.send("Successfully Authenticated");
          //   res.redirect("/shops");
        }
        console.log(req.user);
      });
    }
  })(req, res, next);
});

//shop authentication
app.post("/signup-shop", (req, res) => {
  console.log("in signup shop");
  console.log(req.body);
  const {
    name,
    username,
    email,
    phoneNumber,
    password,
    address,
    pincode,
    // date,
  } = req.body;
  try {
    Shop.findOne({ username: username }, async (err, doc) => {
      if (err) throw err;
      if (doc) res.send("Shop Already exists");
      if (!doc) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newShop = new Shop({
          name: name,
          username: username,
          email: email,
          phoneNumber: phoneNumber,
          password: hashedPassword,
          address: address,
          pincode: pincode,
          // date: date,
        });
        await newShop.save();
        res.send("Shop Created");
        // res.render("shops");
      }
    });
  } catch (err) {
    res.status(400), send(err);
  }
});

app.post("/login-shop", (req, res, next) => {
  console.log("in login shop");

  passport.authenticate("local", (err, shop, info) => {
    if (err) throw err;
    if (!shop) res.send("No such Shop Exists");
    else {
      req.logIn(shop, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        // res.render("shops");
        console.log(req.shop);
      });
    }
  })(req, res, next);
});

//start server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
