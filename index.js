const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const path = require('path');
const axios = require('axios');
const cheerio = require("cheerio");
const { info, error } = require('console');
const { send } = require('process');
let lunchmenu;
let dinnermenu;
let today = new Date();
let Year = today.getFullYear();
let Month = today.getMonth() + 1;
let Day = today.getDate();

let todayurl = `https://hyoyang.goeic.kr/meal/view.do?menuId=9562&year=${Year}&month=${Month}&day=${Day}`;
console.log(todayurl);



const getHtmltodaymenu = async () => {
    try{
        return await axios.get(todayurl);
    } catch (err) {
        console.log(error);
    }
}


function templateHTML(title, css, img, topic_item){
    
    for(let i = 0;i<topic_item.length;i++){
        topic_item[i] = `<p class="topic_item">${topic_item[i]}</p>`;
    }
    
    let template =
    `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
        ${css}
        </style>
        
    </head>
    <body>
        <div id="header">
            <ul>
                <li class="header_item"><a href="/?id=HOME">HOME</a></li>
                <li class="header_item"><a href="/?id=INFO">INFO</a></li>
                <li class="header_item"><a href="/?id=EVENT">EVENT</a></li>
                <li class="header_item"><a href="/?id=STUDY">STUDY</a></li>
            </ul>
        </div>
        <div>
            ${img}
        </div>
        <div id="topic">
            ${topic_item.join('')}
        </div>
            
    </body>
    </html>
    `;
    return template;
}

function readCSS(){
    let csslist = fs.readdirSync('./css');
    let css = ``;
    for(let i = 0;i<csslist.length;i++){
        css += fs.readFileSync(`css/${csslist[i]}`, 'utf8');
    }
    return css;
}

function readtopic(){
    let topic_item = [];
    let topic_itemList = fs.readdirSync(`./topic_items`);
    for(let i = 0 ; i < topic_itemList.length ; i++){
        var item = fs.readFileSync(`topic_items/${topic_itemList[i]}`, 'utf8');
        topic_item.push(item);
    }
    return topic_item;
}

var app = http.createServer(function(req, res){
    console.log(Year, Month, Day);
    let _url = req.url
    let queryData = url.parse(_url, true).query;
    let title = queryData.id;
    let pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
        fs.readFile('index.html', 'utf8', (err, data)=>{
            
            //메뉴 가져오기
            
            getHtmltodaymenu()
             .then(html => {
                let menullist = [];
                let $ = cheerio.load(html.data);
                let $lunchmenu = $("#form > div > table > tbody > tr:nth-child(1) > td:nth-child(3) > span");
                let $dinnermenu = $("#form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > span");
                
                lunchmenu = $lunchmenu.text();
                dinnermenu = $dinnermenu.text();
                
                lunchmenu = lunchmenu.replace(/\s/g, "").replace(/\d/g, '').replace(/\./g, "").replace(/\"/g, "").replace(/\(|\)/g, '').split("ㆍ");
                lunchmenuS = new Set(lunchmenu);
                lunchmenu = [...lunchmenuS];
                lunchmenu = lunchmenu.join("<br>");
                fs.writeFileSync('todayLunchMenu.txt', lunchmenu);
                dinnermenu = dinnermenu.replace(/\s/g, "").replace(/\d/g, '').replace(/\./g, "").replace(/\"/g, "").replace(/\(|\)/g, '').split("ㆍ");
                dinnermenuS = new Set(dinnermenu);
                dinnermenu = [...dinnermenuS];
                dinnermenu = dinnermenu.join("<br>");
                //console.log(dinnermenu);
                fs.writeFileSync('todayDinnerMenu.txt', dinnermenu);
            })       
            
            let img = `<img src="https://ifh.cc/g/NG2PS7.png" alt="banner">`;
            let topic_item = [];
            let title = "COSA-";
            if(queryData.id === "HOME"){
                title += `${queryData.id}`;
                topic_item = readtopic();
                let todayLunchMenu = fs.readFileSync('todayLunchMenu.txt', 'utf8');
                let todayDinnerMenu = fs.readFileSync('todayDinnerMenu.txt', 'utf8');
                topic_item.push(`<ul class="menu"><li id="menu_introtext">오늘의 급식 →</li> <li>중식 : ${todayLunchMenu}</li><li>석식 : ${todayDinnerMenu}</li></span>`);
                res.writeHead(200);
                res.end(templateHTML(title, readCSS(), img, topic_item));
            }       
            else if(queryData.id === 'INFO'){
                title += `${queryData.id}`;
                //img = null;
                topic_item.push(`11년간의 전통을 자랑하는 컴퓨터 공학 동아리 COSA<br>
                COSA의 CO는 Computer Science에서<br>
                A는 Artifical intelligence에서 따왔습니다`);
                res.writeHead(200);
                res.end(templateHTML(title, readCSS(), img, topic_item));
            }
            else if(queryData.id === 'EVENT'){
                title += `${queryData.id}`;
                topic_item.push("임시창");
                res.writeHead(200);
                res.end(templateHTML(title, readCSS(), img, topic_item));
            }
            else if(queryData.id === 'STUDY'){
                title += `${queryData.id}`;
                topic_item.push("임시창");    
                res.writeHead(200);
                res.end(templateHTML(title, readCSS(), img, topic_item));
            }
            else if(queryData.id === undefined){
                res.writeHead(302, {location: `/?id=HOME`});
                res.end();
            }else{
                res.writeHead(404);
                res.end("Not Found");
            }
        });
    } else { //Not found
        res.writeHead(404);
        res.end("Not Found");
    }

    
});
app.listen(3000);