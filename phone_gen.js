const fs = require("fs");

// sdt 11 so
// const DauSoCu = {
//   Vinaphone: "0123,0124,0125,0127,0129,088,091,094",
//   Mobifone: "0121,0121,0122,0126,0128,089,090,093",
//   Viettel: "0162,0163,0164,0165,0166,0167,0168,0169,086,096,097,098",
//   Vietnammoblie: "0188,0186,092",
// };

// sdt 10 so
const DauSoMoi = {
  Vinaphone: "088,091,094,083,084,085,081,082",
  Mobifone: "089,090,093,070,079,077,076,078",
  Viettel: "086,096,097,098,032,033,034,035,036,037,038,039",
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

const phone_gen = () => {
  for (hang in DauSoMoi) {
    let listDauSo = DauSoMoi[hang].split(",");
    console.log("[ ] Process " + hang + ":");

    let phone = [];
    for (let dauso of listDauSo) {
      console.log("[ ] Dau so " + dauso);

      for (let i = 0; i < 9999999; i++) {
        phone.push(dauso + addZero(i, 7));

        if (phone.length > 100000) {
          console.log("[...] Write " + phone.length + " number phones.");
          fs.appendFileSync("data/" + hang + ".txt", phone.join("\n"));
          phone = [];
        }
      }
    }
  }
};

// phone_gen();
