require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const adminRuotes = require("./routes/admin.js");
const userRoutes = require("./routes/user.js");
const authRoutes = require("./routes/auth.js");
const connectDB = require("./config/db.js");

const languages = {
  en: require("./locales/en.json"),
  fa: require("./locales/fa.json"),
  ps: require("./locales/ps.json"),
};

const app = express();

app.use(express.static("public", { dotfiles: "allow" }));

// Allows express to read JSON bodies sent from JavaScript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  // Check if user has a language cookie, default to 'en' (English)
  const langCode = req.cookies.lang || "en";

  // Get the correct dictionary (if code is invalid, fallback to English)
  const translation = languages[langCode] || languages["en"];

  // Make variables available in ALL EJS files automatically
  res.locals.lang = langCode; // e.g., 'fa'
  res.locals.t = translation; // The dictionary object
  res.locals.dir = translation.direction; // 'ltr' or 'rtl'

  next();
});

app.get("/lang/:code", (req, res) => {
  const code = req.params.code;
  // Save their choice in a cookie for 1 year
  res.cookie("lang", code, { maxAge: 900000000 });
  // Reload the page they were currently on
  res.redirect(req.get("referer") || "/");
});

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/", authRoutes);
app.use("/admin", adminRuotes);
app.use("/user", userRoutes);

connectDB();

// Export the app for Vercel's serverless environment
module.exports = app;

// Only listen locally if not in production
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}
