const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Datenbank-Verbindung (simuliert)
const DB_URL = "postgres://admin:supersecret123@db.prod.example.com:5432/myapp";

const startTime = Date.now();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── API Endpoints ──

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/api/info", (req, res) => {
  res.json({
    name: "Max Muster",
    class: "HFI_DEP",
    hobby: "Wandern",
    version: "1.0.0"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    server_time: new Date().toISOString(),
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    hostname: require("os").hostname(),
    node_version: process.version,
    environment: "production",
    db_connected: true
  });
});

// Zufälliges Zitat
const quotes = [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
];

app.get("/api/quote", (req, res) => {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  res.json(random);
});

// Einfacher Rechner
app.get("/api/calc", (req, res) => {
  const { a, b, op } = req.query;
  if (!a || !b || !op) {
    return res.status(400).json({ error: "Parameter a, b und op sind erforderlich" });
  }
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  let result;
  switch (op) {
    case "add": result = numA + numB; break;
    case "sub": result = numA - numB; break;
    case "mul": result = numA * numB; break;
    case "div":
      if (numB === 0) return res.status(400).json({ error: "Division durch 0" });
      result = numA / numB;
      break;
    default:
      return res.status(400).json({ error: "Unbekannte Operation. Verwende add, sub, mul, div" });
  }
  res.json({ a: numA, b: numB, operation: op, result });
});

// Request-Logger (schreibt in Datei)
app.get("/api/log", (req, res) => {
  const logDir = path.join(__dirname, "data");
  const logFile = path.join(logDir, "requests.log");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const entry = `${new Date().toISOString()} - Request von ${req.ip}\n`;
  fs.appendFileSync(logFile, entry);

  const content = fs.readFileSync(logFile, "utf-8");
  res.json({
    total_requests: content.split("\n").filter(l => l.trim()).length,
    log: content
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
  console.log(`Datenbank: ${DB_URL}`);
});
