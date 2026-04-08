import { spawn } from "child_process";
import https from "https";

// Iniciar servidor
const server = spawn("npx", ["tsx", "src/index.ts"], {
  stdio: ["inherit", "pipe", "pipe"],
  cwd: process.cwd(),
});

server.stdout.on("data", (data) => {
  console.log("SERVER:", data.toString().trim());
});

server.stderr.on("data", (data) => {
  console.error("SERVER ERR:", data.toString().trim());
});

// Aguardar servidor iniciar
setTimeout(() => {
  console.log("Fazendo requisição para webhook...");

  const postData = JSON.stringify({
    id: "test",
    title: "Vaga Teste",
    company: "Empresa Teste",
    location: "Remoto",
    url: "https://teste.com"
  });

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/webhook/new-job",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on("data", (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
  });

  req.on("error", (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();

  // Aguardar resposta e parar servidor
  setTimeout(() => {
    server.kill();
    process.exit(0);
  }, 5000);

}, 3000);