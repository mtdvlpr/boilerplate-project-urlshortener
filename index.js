require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const bodyParser = require("body-parser");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const urls = {};

app.get("/api/shorturl/:shorturl", function (req, res) {
  const shortUrl = parseInt(req.params.shorturl, 10);
  const originalUrl = urls[shortUrl];
  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: "No short URL found for given input" });
  }
});

const parseURL = (url) => {
  try {
    const parsed = new URL(url);
    return parsed;
  } catch (e) {
    return null;
  }
};

app.post("/api/shorturl", function (req, res) {
  const parsed = parseURL(req.body.url);
  if (!parsed || !parsed.hostname || !parsed.protocol) {
    return res.json({ error: "invalid url" });
  }
  dns.lookup(parsed.hostname, (err, address) => {
    if (err || !address) {
      return res.json({ error: "invalid url" });
    }
    shortUrl = Object.keys(urls).length + 1;
    urls[shortUrl] = req.body.url;
    return res.json({ original_url: req.body.url, short_url: shortUrl });
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
