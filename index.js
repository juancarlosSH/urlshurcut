const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoSanitize = require("express-mongo-sanitize");
const flash = require("connect-flash");
const passport = require("passport");
const csurf = require("csurf");
const { create } = require("express-handlebars");
const cors = require("cors");
const User = require("./models/User");
require("dotenv").config(); // Loads environment variables from .env file
require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  // Allow all origins to access the API
  credentials: true,
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions)); // Allow all origins to access the API

app.use(
  session({
    // Configure session
    secret: process.env.SESSION_SECRET, // Secret used to sign the session ID cookie
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, // Forces a session that is "uninitialized" to be saved to the store
    name: process.env.SESSION_NAME, // Name of the session cookie
    store: MongoStore.create({
      // Configure session store
      clientPromise: clientDB,
      dbName: process.env.SESSION_DB_NAME,
    }),
    cookie: {
      secure: process.env.MODE === "production", // Only send cookie over HTTPS in production
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
    },
  })
);

app.use(flash()); // Configure flash

app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Configure Passport to use session
passport.serializeUser((user, done) =>
  done(null, { id: user._id, username: user.username })
); // Serialize user to store in session
passport.deserializeUser(async (user, done) => {
  const userData = await User.findById(user.id);
  done(null, { id: userData._id, username: userData.username });
}); // Deserialize user from session

const hbs = create({
  // create a handlebars instance
  extname: ".hbs", // set the extension to .hbs
  partialsDir: "views/components", // set the partials directory
});

app.engine(".hbs", hbs.engine); // register the engine to the app with the engine name
app.set("view engine", ".hbs"); // set the view engine to the app with the view engine name
app.set("views", "./views"); // set the views directory to the app with the views directory

app.use(express.static(__dirname + "/public")); // set the static directory to the app with the static directory
app.use(express.urlencoded({ extended: true })); // set the extended to true to allow for nested objects

app.use(csurf()); // Configure CSRF
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken(); // Set the CSRF token to the response locals
  res.locals.message = req.flash("message"); // Set the flash message to the response locals
  next();
});

app.use(mongoSanitize()); // Configure MongoSanitize

app.use("/", require("./routes/home")); // set the home route to the app with the home route
app.use("/auth", require("./routes/auth"));

app.listen(PORT, () => console.log(`Server is listening in port ${PORT}! 😎`));
