const fs = require("fs");

const password = process.env.ACCESS_PASSWORD;

const fileContent = `
// このファイルはビルド時に自動生成されます
const ACCESS_PASSWORD = "${password}";
`;

fs.writeFileSync("./auth-config.js", fileContent);