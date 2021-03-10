const fs = require("fs");

let nu = "0123456789";
let lo = "qwertyuiopasdfghjklzxcvbnm";
let up = "QWERTYUIOPASDFGHJKLZXCVBNM";
const sp = `!"#$%&'()*+,-./:;<=>?@[\]^_\`{|}~`;

const isMadeFrom = (t, chars) => {
  for (let tx of t) {
    if (chars.indexOf(tx) < 0) {
      return false;
    }
  }
  return true;
};

const filterPassword = (
  inputFile,
  outputFile,
  minLen = 5,
  maxLen = 10,
  chars = nu + lo
) => {
  try {
    const data = fs.readFileSync(inputFile, "utf8");

    let list = data.split("\n");
    let filtered = list.filter(
      (pass) =>
        pass.length >= minLen &&
        pass.length <= maxLen &&
        isMadeFrom(pass, chars)
    );

    console.log(list.length + " -> " + filtered.length);

    fs.writeFileSync(outputFile, filtered.join("\n"), "utf-8");
  } catch (err) {
    console.error(err);
  }
};

// filter theo de cua thay
filterPassword(
  "./data/62kcmnpass.txt",
  "./data/filtered-62kcmnpass2.txt",
  5,
  10,
  nu + lo
);

// filter phone number
// filterPassword(
//   "./data/filtered-rockyou.txt",
//   "./data/filtered-phone-rockyou.txt",
//   10,
//   10,
//   nu
// );
