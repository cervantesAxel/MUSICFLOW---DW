import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const clientId = "182584c47fe84809b439ef0209bf8aa8";
const clientSecret = "5ce8fc4a460e475690ac95dd78fdced2";

app.get("/token", async (req, res) => {
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();
  res.json(data);
});

app.listen(5050, () => console.log("Servidor listo en http://127.0.0.1:5050"));
