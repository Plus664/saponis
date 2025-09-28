const fs = require("fs");

const password = process.env.ACCESS_PASSWORD;
const filePath = "./javascript/utility-handler.js";

const newSecretBlock = `const ACCESS_PASSWORD = "${password}";`;

let fileContent = fs.readFileSync(filePath, "utf8");

const pattern = /\/\/ --- \[START_NETLIFY_SECRET\] ---\r?\n\/\/ --- \[END_NETLIFY_SECRET\] ---/s;

fileContent = fileContent.replace(
  pattern,
  `// --- [START_NETLIFY_SECRET] ---\n${newSecretBlock}\n// --- [END_NETLIFY_SECRET] ---`
);

fs.writeFileSync(filePath, fileContent, "utf8");