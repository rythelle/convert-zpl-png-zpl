var fs = require('fs'); //Biblioteca File System
const path = require("path"); //Biblioteca de caminhos de arquivos
var zlib = require('zlib'); //Biblioteca de codificação e descodificação
var PNG = require('pngjs').PNG; //Biblioteca para trabalhar com imagens PNG
var Jimp = require('jimp'); //Biblioteca de trabalhar com imagens

////////////////////////////////////////////////////////////////////////

const numpecapath = path.resolve("../NumeroPecaNodeJS.txt"); //Monta o caminho de onde está localizada o arquivo que armazena o número da peça escrita pelo InduSoft

//Lê o número da peça atual, escrita pela InduSoft
try{
    var numpeca = fs.readFileSync(numpecapath, 'utf8')
} catch (err) {
    console.log(err);
}

////////////////////////////////////////////////////////////////////////

const filepath = path.resolve("../print/Etiquetas_Entrada_Compartilhada/" + numpeca + ".prn"); //Monta o caminho de onde está localizada a etiqueta

try{
    const data_etiqueta = fs.readFileSync(filepath, 'utf8')
    var txt = data_etiqueta.split(':'); //Separa todo o conteúdo do ZPL em Array's utilizando o delimitador :
} catch (err) {
    console.log(err);
}

var str = txt[3]; //Pega a última parte do arquivo ZPL

var lastPart = str.substring(0,4); //Pega o valor CRC do Z64 do arquivo ZPL

var Base64 = txt[2] + ":" + lastPart; //Concatena a codificação Base64 com : e mais o CRC do arquivo ZPL

////////////////////////////////////////////////////////////////////////

var zpl = Base64.replace(/\s/g,''); // .replace(/\s/g,'') retira todos os espaços em branco e substitui por nada, assim juntando tudo na mesma linha

////////////////////////////////////////////////////////////////////////

const buffer = Buffer.from(zpl, 'base64'); //Descodifica o Z64 que está codificado em Base64

const grf = zlib.inflateSync(buffer); //Descomprimi o código Z64 descodificado

// These values are from the ^GF command
const png = new PNG({
    width: 148*8,
    height: 393088 / 148,
    filterType: -1
});

let offs = 0;
let data = png.data;
for (let i = 0; i < 393088; i++) {
    let byte = grf[i];
    for (let bit = 0x80; bit; bit = bit >>> 1) {
        let bw = (bit & byte) ? 0 : 255; // black (0) or white (255)
        data[offs++] = bw;
        data[offs++] = bw;
        data[offs++] = bw;
        data[offs++] = 255;  // fully opaque
    }
}

png.pack().pipe(fs.createWriteStream("../print/Etiqueta_Entrada_Z64/" + numpeca + ".png"));

////////////////////////////////////////////////////////////////////////

setTimeout(() => {
    Jimp.read("../print/Etiqueta_Entrada_Z64/" + numpeca + ".png").then(res => { //Lê a imagem do ZPL gerado
        return res
        .cover(1200,500,2)// Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_TOP) //(Largura,Altura,corte da imagem)Corta a imagem original para deixar apenas a etiqueta do queijo 1420,610,1
        //.resize(1000,400)
        //.scaleToFit(1100,450)
        //.rotate(90)
        .writeAsync('../print/Etiqueta_Entrada/' + numpeca + '.png'), //Salva novamente a imagem cortada em PNG
        console.log("PNG foi gerado!")
    }).catch(err => {
        console.log(err);
    });
}, 1000);
