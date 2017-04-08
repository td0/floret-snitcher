var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var Entities = require('html-entities').AllHtmlEntities;

official = false;
popular = true;

fmt = "txt";
prettyjson = false;
sjson = false;

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
var url =  (popular)? "https://store.line.me/themeshop/showcase/top_creators/en?page=" :
    "https://store.line.me/themeshop/showcase/new/en?page=";
url = (official)? "https://store.line.me/themeshop/showcase/new/en?page=" : url;
var fn = (popular)? "creators_popular" : "creators";
fn = (official)? "officials" : fn;
var resp = 200;

function fetchPage(){
    urli=url+i.toString();

    request(urli, function(error, response, html){
        resp = response.statusCode ;
        if(!error && response.statusCode==200){
            console.log("\nfetching page "+(i)+" "+fn);
            console.log(urli);
            let $ = cheerio.load(html);
            $('.mdCMN05Ttl').each(function(x){
                //writeFormat($(this));
                cr = (n==1)?'':'\n\n';
                if(fmt=='txt'){
                   l+=cr+e.decode($(this).html())+
                       "\nhttp://dl.shop.line.naver.jp/themeshop/v1/products/"+
                       $(this).prev().html().substring(76,123)+
                       "/ANDROID/theme.zip";
                }else if(fmt=='json'){
                   img = $(this).prev().children().attr("src");
                   id = (img.length == 127)?img.substr(53,48):img.substr(53,47);
                   if(sjson){
                       l.theme[e.decode($(this).html())] = id;
                   }else{
                       tmp={
                           "link" : "http://dl.shop.line.naver.jp/themeshop/v1/products/"+id+"/ANDROID/theme.zip",
                           "img" : img
                       };
                       l.theme[e.decode($(this).html())] = (tmp);
                   }
                }
            });

            console.log("Page "+(i)+" "+fn+" fetched");
        }else{
            resp=0;
            console.log("\nfetching page "+(i)+" "+fn);
            console.log(response.statusCode);
            console.error("Error : "+error);
            return;;
        }
        i++;
    })
}

function writeFormat(el){
    cr = (n==1)?'':'\n\n';
    if(fmt=='txt'){
       l+=cr+e.decode(el.html())+
           "\nhttp://dl.shop.line.naver.jp/themeshop/v1/products/"+
           el.prev().html().substring(76,123)+
           "/ANDROID/theme.zip";
        n++;
    }else if(fmt=='json'){
       img = el.prev().children().attr("src");
       id = (img.length == 127)?img.substr(53,48):img.substr(53,47);
       if(sjson){
           l.theme[e.decode(el.html())] = id;
       }else{
           tmp={
               "link" : "http://dl.shop.line.naver.jp/themeshop/v1/products/"+id+"/ANDROID/theme.zip",
               "img" : img
           };
           l.theme[e.decode(el.html())] = (tmp);
       }
    }
}

function writeFile(){
    if(!fs.existsSync('./output')){
        fs.mkdirSync('./output');
    }
    if(fmt=="json"){ 
        l = (prettyjson)? JSON.stringify(l,null,4) : JSON.stringify(l);
        fn = (sjson)? fn:'l-'+fn;
    }
    fs.writeFile("./output/"+fn+"."+fmt, l, function(err){
        if(!err) console.log('\nFile successfully written!'+
            '\nCheck your project directory for the \'./output/'+fn+'.'+fmt+'\' directory');
        else console.error(err);
    });
}

async.whilst(
    function(){ 
        return resp==200;
    },
    function(callback){
        setTimeout(function(){
            fetchPage();
            callback();
        },1000);
    },
    function(err){
        console.error(err);
        setTimeout(function(){
            writeFile();
        },1000);
    }
)






