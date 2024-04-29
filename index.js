const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const path = require('path');
const { info } = require('console');
const { send } = require('process');

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

    function sendtemplate(){
        res.writeHead(200);
        res.end(templateHTML(title, readCSS(), img, topic_item));
    }
    function senderr(){
        alert('error is happen');
        res.writeHead(302, {location: `/?id=HOME`});
        res.end();
    }

    let _url = req.url
    let queryData = url.parse(_url, true).query;
    let title = queryData.id;
    let pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
        fs.readFile('index.html', 'utf8', (err, data)=>{
            let img = `<img src="https://ifh.cc/g/NG2PS7.png" alt="banner">`;
            let topic_item = [];
            let title = "COSA-";
            if(queryData.id === "HOME"){
                title += `${queryData.id}`;
                topic_item = readtopic();
            }       
            else if(queryData.id === 'INFO'){
                title += `${queryData.id}`;
                //img = null;
                topic_item.push(`11년간의 전통을 자랑하는 컴퓨터 공학 동아리 COSA<br>
                COSA의 CO는 Computer Science에서<br>
                A는 Artifical intelligence에서 따왔습니다`);
            }
            else if(queryData.id === 'EVENT'){
                title += `${queryData.id}`;
                topic_item.push("COSA “최종 합격”을 축하드립니다!<br>면접보느라 정말 수고 많으셨습니다.<br>즐거운 1년 함께 보내면 좋겠습니다.<br>동아리 확정 문자는 금요일까지 연락 부탁드립니다.<br>동아리 참여 확정 연락은 “참여하겠습니다”로 부탁드립니다.");
            }
            else if(queryData.id === 'STUDY'){
                title += `${queryData.id}`;
                topic_item.push("asdfasdfasfd");
            }
            else if(queryData.id === undefined){
                senderr();
            }else{
                senderr();
            }
            res.writeHead(200);
            res.end(templateHTML(title, readCSS(), img, topic_item));
        });
    } else { //Not found
        res.writeHead(404);
        res.end("Not Found");
    }

    
});
app.listen(3000);