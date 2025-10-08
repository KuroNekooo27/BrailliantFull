require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const { exec } = require("child_process");
const multer = require("multer");
const helmet = require("helmet"); // <-- added
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/files", express.static("files"));
app.use(morgan("dev"));

// 🛡️ Helmet Security Headers
app.use(
  helmet({
    frameguard: { action: "deny" }, // X-Frame-Options
    noSniff: true, // X-Content-Type-Options
    referrerPolicy: { policy: "no-referrer" }, // Referrer-Policy
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
    permissionsPolicy: {
      features: {
        camera: ["none"],
        microphone: ["none"],
        geolocation: ["none"],
        fullscreen: ["self"],
      },
    },
  })
);

// Strict-Transport-Security (HSTS) — only works over HTTPS
app.use(
  helmet.hsts({
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  })
);

// Config
require("./config/mongoose.config");
require("./config/cloudinary.config");

// Routes
require("./routes/user.route")(app);
require("./routes/book.route")(app);
require("./routes/admin.route")(app);
require("./routes/audit_trail.route")(app);
require("./routes/section.route")(app);
require("./routes/student.route")(app);
require("./routes/request_book.route")(app);
require("./routes/login.route")(app);
require("./routes/arduino.route")(app);
require("./routes/email.route")(app);
require("./routes/book_read.route")(app);
require("./routes/analytics.route")(app);

const userRoutes = require("./routes/userRoutes");
app.use("/api/v1/auth", userRoutes);

const pdfRoutes = require("./routes/pdfRoutes");
app.use("/api/pdf", pdfRoutes);

// Multer setup (temp storage for uploaded files)
const upload = multer({ dest: "uploads/" });

// 📄 PDF to BRF Conversion Route
app.post("/upload-pdf-to-brf", upload.single("file"), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const pdfOriginalName = path.parse(req.file.originalname).name;

    const pdfBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const brfFilePath = `output_${Date.now()}.brf`;

    const table = "/usr/share/liblouis/tables/en-us-g2.ctb";
    const child = spawn("lou_translate", ["--forward", table]);

    const outputStream = fs.createWriteStream(brfFilePath);
    child.stdout.pipe(outputStream);

    child.stderr.on("data", (data) => {
      console.error("lou_translate error:", data.toString());
    });

    child.stdin.write(text);
    child.stdin.end();

    child.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: "Translation failed" });
      }

      const brfDownloadName = `${pdfOriginalName}.brf`;
      res.download(brfFilePath, brfDownloadName, (err) => {
        if (!err) {
          fs.unlinkSync(pdfPath);
          fs.unlinkSync(brfFilePath);
        }
      });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.get("/", (req, res) => {
  res.json("Server is running with enhanced security headers ✅");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
