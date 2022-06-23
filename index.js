const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoSanitize = require("express-mongo-sanitize");
const flash = require("connect-flash");
const passport = require("passport");
const csurf = require("csurf");
const { create } = require("express-handlebars");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");
const clientDB = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  credentials: true,
  origin: process.env.URL,
  methods: ["GET", "POST"],
};
app.use(cors(corsOptions));

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: process.env.SESSION_NAME,
    store: MongoStore.create({
      clientPromise: clientDB,
      dbName: process.env.DB_NAME,
    }),
    cookie: {
      secure: process.env.ENV_MODE === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) =>
  done(null, { id: user._id, username: user.username })
);
passport.deserializeUser(async (user, done) => {
  const userData = await User.findById(user.id);
  done(null, { id: userData._id, username: userData.username });
});

const hbs = create({
  extname: ".hbs",
  partialsDir: "views/components",
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

app.use(csurf());
app.use(mongoSanitize());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.message = req.flash("message");
  next();
});

app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

app.listen(PORT, () => console.log(`Server is listening in port ${PORT}! 😎`));
