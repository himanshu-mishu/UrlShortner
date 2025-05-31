require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const urlParser = require("url");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// 🔗 In-memory DB to store URLs
const urlDatabase = {};
let urlCount = 1;

// ✅ POST: Create a short URL
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;
  const parsedUrl = urlParser.parse(originalUrl);

  // Check for valid hostname
  if (!parsedUrl.hostname) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(parsedUrl.hostname, (err, address) => {
    if (err) {
      return res.json({ error: "invalid url" });
    } else {
      const shortUrl = urlCount++;
      urlDatabase[shortUrl] = originalUrl;
      res.json({
        original_url: originalUrl,
        short_url: shortUrl,
      });
    }
  });
});

// ✅ GET: Redirect short URL to original
app.get("/api/shorturl/:short", function (req, res) {
  const short = req.params.short;
  const originalUrl = urlDatabase[short];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: "No short URL found for given input" });
  }
});

// ✅ Server Start
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
