var fs = require("fs");
const path = require("path");
var zlib = require("zlib");
var PNG = require("pngjs").PNG;
var Jimp = require("jimp");

const pathNum = path.resolve("../NumNodeJS.txt");

try {
  var num = fs.readFileSync(pathNum, "utf8");
} catch (err) {
  console.log(err);
}

const filepath = path.resolve("../print/path-label/" + num + ".prn");

try {
  const data_label = fs.readFileSync(filepath, "utf8");
  var txt = data_label.split(":");
} catch (err) {
  console.log(err);
}

var str = txt[3];

var lastPart = str.substring(0, 4);

var Base64 = txt[2] + ":" + lastPart;

var zpl = Base64.replace(/\s/g, "");

const buffer = Buffer.from(zpl, "base64");

const grf = zlib.inflateSync(buffer);

const png = new PNG({
  width: 148 * 8,
  height: 393088 / 148,
  filterType: -1,
});

let offs = 0;
let data = png.data;
for (let i = 0; i < 393088; i++) {
  let byte = grf[i];
  for (let bit = 0x80; bit; bit = bit >>> 1) {
    let bw = bit & byte ? 0 : 255; //black (0) or white (255)
    data[offs++] = bw;
    data[offs++] = bw;
    data[offs++] = bw;
    data[offs++] = 255; //fully opaque
  }
}

png.pack().pipe(fs.createWriteStream("../print/Label-Z64/" + numPart + ".png"));

setTimeout(() => {
  Jimp.read("../print/Label-Z64/" + numPart + ".png")
    .then((res) => {
      return (
        res
          .cover(1200, 500, 2) // Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_TOP)
          //.resize(1000,400)
          //.scaleToFit(1100,450)
          //.rotate(90)
          .writeAsync("../print/Entry-Label/" + num + ".png"),
        console.log("PNG was generated")
      );
    })
    .catch((err) => {
      console.log(err);
    });
}, 1000);
