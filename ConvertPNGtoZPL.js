const fs = require('fs'); //Biblioteca File System
const PNG = require('pngjs').PNG; //Biblioteca para trabalhar com imagens tipo PNG
const rgbaToZ64 = require('zpl-image').rgbaToZ64; //Biblioteca que transforma imagem em ZPL
const path = require("path"); //Biblioteca de caminhos de arquivos
var printer = require('printer');
util = require('util');

const numpecapath = path.resolve("../NumeroPecaNodeJS.txt"); //Monta o caminho de onde está localizada o arquivo que armazena o número da peça escrita pelo InduSoft

//Lê o número da peça atual, escrita pela InduSoft
try{
    var numpeca = fs.readFileSync(numpecapath, 'utf8')
} catch (err) {
    console.log(err);
}

let buf = fs.readFileSync('../print/Etiqueta_Entrada/' + numpeca + '.png'); //Leio o PNG e os dados tipo Buffer
let png = PNG.sync.read(buf); //Leio o dados tipo Buffer e converto eles para códigos RGBA e dados para montar o ZPL
let res = rgbaToZ64(png.data, png.width, { black:50, rotate:'L' }); //Monto o ZPL

//res.length é o comprimento GRF descompactado
//res.rowlen é o comprimento da linha GRF
//res.z64 é a string codificada em Z64
let zpl_convert = `^XA^LH0,0^FS^FWN^FS^MMP^FS^PON^FS^PMN^FS^PW549^LL1422^FS^LRN^FS^FO0,0^GFA,${res.length},${res.length},${res.rowlen},${res.z64}^FS^PQ1^XZ`; //^XA^LH0,0^FWN^PON^PMN^LRN^FO10,10^GFA ^PQ1,0,1,Y^XZ ^PW1420^LL1422 ^PW549^LL1422  ~CD,~CC^~CT~

fs.writeFile('../print/Etiqueta_Entrada/' + numpeca + '.zpl', zpl_convert,{enconding:'base64',flag: 'w'}, function (err) {
    if (err) {
        console.log('Erro na Escrita!');
    }else{
        console.log('Arquivo salvo!');
    }
});