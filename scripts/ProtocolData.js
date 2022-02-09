const ProtocolDataAddress = "0xFA3bD19110d986c5e5E9DD5F69362d05035D045B";
const ProtocolDataABI = require("../ProtocolDataABI.json");
const ProtocolDataContract = new web3.eth.Contract(
  ProtocolDataABI,
  ProtocolDataAddress
);

const userAddress = "0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936";

let arr = [
  "0x341d1f30e77D3FBfbD43D17183E2acb9dF25574E",
  "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F",
  "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
  "0xBD21A10F619BE90d6066c941b04e340841F1F989",
  "0x0d787a4a1548f673ed375445535a6c7A1EE56180",
  "0x0d787a4a1548f673ed375445535a6c7A1EE56180",
  "0x3C68CE8504087f89c640D02d133646d98e64ddd9",
  "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
];

async function GetUserDetails() {
  for (let i = 0; i < arr.length; i++) {
    const userData = await ProtocolDataContract.methods
      .getUserReserveData(arr[i], userAddress)
      .call();
    console.log(userData);
  }
}

GetUserDetails();
