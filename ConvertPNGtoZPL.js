const fs = require("fs");
const PNG = require("pngjs").PNG;
const rgbaToZ64 = require("zpl-image").rgbaToZ64;
const path = require("path");

const pathNum = path.resolve("../NumNodeJS.txt");

try {
  var num = fs.readFileSync(pathNum, "utf8");
} catch (err) {
  console.log(err);
}

let buf = fs.readFileSync("../print/path-label/" + num + ".png");
let png = PNG.sync.read(buf);
let res = rgbaToZ64(png.data, png.width, { black: 50, rotate: "L" });

//res.length is the uncompressed GRF length
//res.rowlen is the length of the GRF line
//res.z64 is the Z64 encoded string
let zpl_convert = `^XA^LH0,0^FS^FWN^FS^MMP^FS^PON^FS^PMN^FS^PW549^LL1422^FS^LRN^FS^FO0,0^GFA,${res.length},${res.length},${res.rowlen},${res.z64}^FS^PQ1^XZ`; //^XA^LH0,0^FWN^PON^PMN^LRN^FO10,10^GFA ^PQ1,0,1,Y^XZ ^PW1420^LL1422 ^PW549^LL1422  ~CD,~CC^~CT~

fs.writeFile(
  "../print/Entry-Label/" + num + ".zpl",
  zpl_convert,
  { encoding: "base64", flag: "w" },
  function (err) {
    if (err) {
      console.log("Writing error");
    } else {
      console.log("Saved file");
    }
  }
);
