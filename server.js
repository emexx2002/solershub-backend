const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT;
let DB;

if (process.env.ENV === "development") {
  DB = process.env.DB_DEV;
} else {
  DB = process.env.DB_PROD;
}

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB CONNECTION SUCCESSFUL!");
  })
  .catch((err) => {
    console.log("AN ERROR OCCURED WHILE CONNECTING TO THE DATABASE", err);
  });

app.listen(PORT, () => {
  console.log("APP RUNNING ON PORT", PORT);
});
