const config = require("./config");
const ethers = require("ethers");
const fs = require("fs");
const { convert } = require("convert-svg-to-png");

const abi = JSON.parse(fs.readFileSync(config.abi, "utf-8"));
require("dotenv").config();
const infuraApi = process.env.INFURAMAIN;
const ethereum = ethers.ethers;
const provider = new ethers.providers.JsonRpcProvider(infuraApi);

const CONTRACT = () => new ethereum.Contract(config.contract, abi, provider);

async function downloadMice(id) {
  try {
    const token_data = await CONTRACT().tokenURI(id);
    // remove data:application/json;base64,
    const token_data_base64 = token_data.slice(29);
    // convert base64
    const decoded_data = Buffer.from(token_data_base64, "base64").toString(
      "utf8"
    );
    // repeate the same for image
    let image_data = JSON.parse(decoded_data).image;
    const [_, mice_data] = image_data.split(",");
    // get the svg data
    const mice_svg = Buffer.from(mice_data, "base64").toString();
    // set true in the config if svg to be created
    if (config.createSVG) {
      fs.writeFileSync(`./svg/Baby Mouse #${id}.svg`, mice_svg);
    }
    await convert(mice_svg, {
      height: config.imageHeight,
      width: config.imageWidth,
    }).then((mice_png) => {
      fs.writeFileSync(`./png/Baby Mouse #${id}.png`, mice_png);
    });
  } catch (e) {
    console.log(e);
    return e;
  }
}
// downloading in batches to be implemented
async function downloadBabyMouse() {
  for (i = config.fetchFrom; i <= config.fetchTill; i++) {
    await downloadMice(i).then((image) => image);
  }
}
downloadBabyMouse();
