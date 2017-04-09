const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const readline = require('readline');
const ArgumentParser = require('argparse').ArgumentParser;
const Entities = require('html-entities').AllHtmlEntities;
const pjson = require('./package.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var argparser = new ArgumentParser({
    version: pjson.version,
    addHelp:true,
    description: pjson.description
});
argparser.addArgument(
    '-c',
    {
        help: 'Scrape creator\'s theme instead of official\'s',
        action: 'storeFalse'
    }
);
argparser.addArgument(
    '-j',
    {
        help: 'Get .json output instead of .txt',
        action: 'storeTrue'
    }
);
argparser.addArgument(
    '-n',
    {
        help: 'Scrape new category instead of popular',
        action: 'storeFalse'
    }
);
argparser.addArgument(
    '-t',
    {
        help: 'Get spaced & tabbed json instead of single-line one',
        action: 'storeTrue'
    }
);
argparser.addArgument(
    '-f',
    {
        help: 'Get fulll json containing full hyperlink instead of name and ID',
        action: 'storeTrue'
    }
);
args=argparser.parseArgs();

var official = args.c;
var pop = args.n;
var fmt = (args.j)?"json":"txt";
var tjson = args.t;
var fjson = args.f;

let str = "\n\tGratter Commence\n\nTheme Target\t: "+
    ((official)?"Official":"Creator")+
    "\nFiletype\t: ."+fmt;
str = (official)? str:str+
    "\nCategory\t: "+ ((pop)?"Popular":"New");
str = (fmt==="json")? str+
    "\nFormatting\t: "+ ((fjson)?"Full + ":"Short + ")+
    ((tjson)?"Tabbed":"Single-Line"):str;
str = str+"\n";
console.log(str); 

//String version
var l=(fmt=="txt")?'':
    {
        dlink:"http://dl.shop.line.naver.jp/themeshop/v1/products/<THEME_ID>/<DEVICE_PLATFORM>/theme.zip",
        img:{
            a:"https://sdl-shop.line.naver.jp/themeshop/v1/products/<THEME_ID>/ANDROID/en/preview_001_720x1232.png",
            b:"https://sdl-shop.line.naver.jp/themeshop/v1/products/<THEME_ID>/ANDROID/en/preview_002_720x1232.png",
            c:"https://sdl-shop.line.naver.jp/themeshop/v1/products/<THEME_ID>/ANDROID/en/preview_003_720x1232.png",
            d:"https://sdl-shop.line.naver.jp/themeshop/v1/products/<THEME_ID>/ANDROID/en/preview_004_720x1232.png",
            e:"https://sdl-shop.line.naver.jp/themeshop/v1/products/<THEME_ID>/ANDROID/en/preview_005_720x1232.png"
        },
        theme:{}
    }; 


var e = new Entities();
var n = 1;
var i = 1;
var url =  (pop)? "https://store.line.me/themeshop/showcase/top_creators/en?page=" :
    "https://store.line.me/themeshop/showcase/new_creators/en?page=";
url = (official)? "https://store.line.me/themeshop/showcase/new/en?page=" : url;
var fn = (pop)? "creators_popular" : "creators";
fn = (official)? "officials" : fn;
var resp = 200;

q = async.queue(function(task,callback){
        request(task.url, function(error, response, html){
            resp = response.statusCode ;
            if(!error && response.statusCode==200){
                let $ = cheerio.load(html);
                $('.mdCMN05Ttl').each(function(){
                    cr = (n==1)?'':'\n\n';
                    if(fmt=='txt'){
                       l+=cr+e.decode($(this).html())+
                           "\nhttp://dl.shop.line.naver.jp/themeshop/v1/products/"+
                           $(this).prev().html().substring(76,123)+
                           "/ANDROID/theme.zip";
                        n++;
                    }else if(fmt=='json'){
                       img = $(this).prev().children().attr("src");
                       id = (img.length == 127)?img.substr(53,48):img.substr(53,47);
                       if(!fjson){
                           l.theme[e.decode($(this).html())] = id;
                       }else{
                           tmp={
                               "link" : "http://dl.shop.line.naver.jp/themeshop/v1/products/"+
                                           id+"/ANDROID/theme.zip",
                               "img" : img
                           };
                           l.theme[e.decode($(this).html())] = (tmp);
                       }
                    }
                });
                rl.write("\tFetching "+i+" Page(s)");
                readline.cursorTo(rl,0);
            }else{
                resp=0;
                readline.moveCursor(rl,0,2);
                rl.write("Page "+i+" response code : "+response.statusCode);
                readline.cursorTo(rl,0);
            }
        });
        callback();
    },5);

q.drain = function(){
    if(!fs.existsSync('./output')){
        fs.mkdirSync('./output');
    }
    if(fmt=="json"){ 
        l = (tjson)? JSON.stringify(l,null,4) : JSON.stringify(l);
        fn = (fjson)? 'l-'+fn:fn;
    }
    fs.writeFile("./output/"+fn+"."+fmt, l, function(err){
        if(!err){
            readline.cursorTo(rl,0);
            readline.moveCursor(rl,0,1);
            rl.write('\nFile successfully written!'+
                '\nCheck your project directory for the \'./output/'+
                fn+'.'+fmt+'\' directory\n');
        }else{
            readline.cursorTo(rl,0);
            readline.moveCursor(rl,0,2);
            rl.write(err);
        }
    });
}

while(resp==200){
    i++;
    urli=url+i.toString();
    q
}






