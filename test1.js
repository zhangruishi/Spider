var http = require('http');
var fs = require('fs');

var cheerio = require('cheerio');
var request = require('request');

var i = 0;
var url = "http://songshuhui.net/archives/96881";//初始化的地址

function fetchPage(x){
    startFetch(x);
}//封装函数

function startFetch(x){
    //采用http模块向服务器发起一次get请求
    http.get(x,function(res){
        var html = ""; //用来储存整个页面的html内容
        res.setEncoding("utf-8");//防止中文乱码
        res.on('data',function(chunk){
            html  += chunk;
        });//监听data事件，每次取一块数据
        res.on('end',function(){
            var $ = cheerio.load(html);//用cheerio模块解析html

            var author = $(".metax_single a:first-child").text().trim();//获取文章的作者

            var title = $(".atrctitle .contenttitle a").text().trim();//获取文章的标题

            var link = $(".atrctitle .contenttitle a").attr("href");//获取文章的网页地址

            var new_item = {
                Title: title,
                Author: author,
                Link: link,
                i: i =i + 1//用来判断获取了多少文章
            };
            console.log(new_item);

            savedContent($,title);//储存文章的文字内容

            savedImg($,title);//储存文章的图片内容

            var nextLink = $(".navilinks .prevlink a").attr("href");

            var str = encodeURI(nextLink);

            if(i <= 500){
                fetchPage(str);
            }//通过控制i控制抓取的文章的数目
        });//监听end事件，如果整个网页内容都获取完毕，执行回调函数
    }).on('error',function (err) {
        console.log(err);
    });
}

function savedContent($,title){
    $(".entry p").each(function(index,item) {
        var x = $(this).text();

        x = x + "\n";

        fs.appendFile("./data/" + title + ".txt", x, "utf-8", function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
}
//本地储存爬取的文字资源
function savedImg($,title){
    $(".entry .wp-caption img").each(function(index,item) {
        var img_title = $(this).attr("alt");

        var img_filename = img_title + ".jpg";

        var img_src = $(this).attr("src");

        request.head(img_src,function(err,res,body){
            if(err){
                console.log(err);
            }
        });

        request(img_src).pipe(fs.createWriteStream("./img/" + title + "--" + img_filename));
        //采取request模块向服务器发起一次请求，获取图片资源
    });
}
//本地储存爬取的图片资源
fetchPage(url);