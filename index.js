
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
if (Month < 10) {
    Month = '0' + Month;
}
if (Day < 10) {
    Day = '0' + Day;
}
let Hour = today.getHours();
let Minute = today.getMinutes();
let Second = today.getSeconds();
let topic_item = [];

let todayurl = `https://hyoyang.goeic.kr/meal/view.do?menuId=9562&year=${Year}&month=${Month}&day=${Day}`;
console.log(todayurl);


function templateHTML(title, css, img, topic_item, topic1) {

    for (let i = 0; i < topic_item.length; i++) {
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
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.3/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.3/ScrollTrigger.min.js"></script>
    </head>
    <body>
        <div id="header">
            <ul>
                <li class="header_item"><a href="/?id=HOME">HOME</a></li>
                <li class="header_item"><a href="/?id=INFO">INFO</a></li>
                <li class="header_item"><a href="/?id=EVENT">EVENT</a></li>
                <li class="header_item"><a href="/?id=STUDY">STUDY</a></li>
                <li class="header_item"><a href="/?id=UPDATE">UPDATE</a></li>
            </ul>
            <div class="header_descript">
            <span id="header_descript_main">임시로 넣은걸까 아닐까</span>
            </div>
            <script>
            </script>
        </div>
        <div>${img}</div>
        <div id="topic">
            ${topic1}
            ${topic_item.join('')}
        </div>
        <script>
        let header_items = document.querySelectorAll('.header_item');
        let topic_items = document.querySelectorAll('.topic_item');
        let header_descript_main = document.querySelector('#header_descript_main');
        let header_descript = ["HOME창으로 메인 이슈가 탑재되어 있습니다", "Information창으로 COSA라는 이름의 유래에 대한 정보가 탑재되어 있습니다", 
                                "EVENT창으로 COSA 관련 행사 및 일정에 관한 정보가 탑재되어있습니다"];
        let observerOn = new IntersectionObserver((e)=>{
            e.forEach((box)=>{
                box.target.style.opacity = 1;
            })
        })
        for(let i = 0;i<header_items.length;i++){
            setTimeout(()=>{
                observerOn.observe(header_items[i]);
            }, 100+i*100);
        }
        gsap.registerPlugin(ScrollTrigger);
        function setScrollTrigger(e){
            e.forEach((box)=>{
                gsap.to(box, {
                    scrollTrigger: {
                        trigger: box,
                        start: "20% 80%",
                        end: "60% 90%",
                        scrub: true,
                        //markers: true, 
                    },
                    opacity: 1,                 
                    y: -50,
                    duration: 0.01,
                });
            });
            
        }
        setScrollTrigger(['.topic_item', '.foodmenu', '.topic_time']);
        

        for(let i = 0 ; i < header_items.length;i++){
            header_items[i].addEventListener('mouseenter', (event) => {
                header_descript_main.innerHTML = header_descript[i];
            });
            /*header_items[i].addEventListener('mouseleave', (event) => {
                header_descript_main.innerHTML = '';
            });*/
        }
        
        </script>
            
    </body>
    </html>
    `;
    return template;
}
const getHtmltodaymenu = async () => {
    try {
        return await axios.get(todayurl);
    } catch (err) {
        console.log(error);
    }
}
function readCSS() {
    let csslist = fs.readdirSync('./css');
    let css = ``;
    for (let i = 0; i < csslist.length; i++) {
        css += fs.readFileSync(`css/${csslist[i]}`, 'utf8');
    }
    return css;
}

function settopic(dir) {
    let topic_itemList = fs.readdirSync(`./${dir}`);
    for (let i = 0; i < topic_itemList.length; i++) {
        var item = fs.readFileSync(`${dir}/${topic_itemList[i]}`, 'utf8');
        topic_item.push(item);
    }
}

var app = http.createServer(function (req, res) {

    let _url = req.url
    let queryData = url.parse(_url, true).query;
    let title = queryData.id;
    let pathname = url.parse(_url, true).pathname;
    if (pathname === '/') {
        fs.readFile('index.html', 'utf8', (err, data) => {

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

                    dinnermenu = dinnermenu.replace(/\s/g, "").replace(/\d/g, '').replace(/\./g, "").replace(/\"/g, "").replace(/\(|\)/g, '').split("ㆍ");
                    dinnermenuS = new Set(dinnermenu);
                    dinnermenu = [...dinnermenuS];
                    dinnermenu = dinnermenu.join("<br>");
                    if(lunchmenu ==  ''){
                        lunchmenu = "오늘의 중식은 없습니다";

                    }
                    if(dinnermenu == ''){
                        dinnermenu = "오늘의 석식은 없습니다";
                    }
                    //console.log(lunchmenu, dinnermenu);
                    fs.writeFileSync('todayLunchMenu.txt', lunchmenu);
                    fs.writeFileSync('todayDinnerMenu.txt', dinnermenu);
                })

            let img = `<img src="https://ifh.cc/g/NG2PS7.png" alt="banner">`;
            topic_item = [];
            let title = "COSA-";
            if (queryData.id === "HOME") {
                title += `${queryData.id}`;
                settopic('topic_items');
                let todayLunchMenu = fs.readFileSync('todayLunchMenu.txt', 'utf8');
                console.log(todayLunchMenu);
                let todayDinnerMenu = fs.readFileSync('todayDinnerMenu.txt', 'utf8');
                topic_item.push(`<ul class="foodmenu"><li id="menu_introtext">오늘의 급식 →</li> <li>중식 : ${todayLunchMenu}</li><li>석식 : ${todayDinnerMenu}</li></span>`);
                res.writeHead(200);
                res.end(templateHTML(title, readCSS(), img, topic_item, `<p class="topic_time">Time of the Site : ${Year}-${Month}-${Day}</p>`));
            }
            else if (queryData.id === 'INFO') {
                title += `${queryData.id}`;
                //img = null;
                topic_item.push(`
                11년간의 전통을 자랑하는 컴퓨터 공학 동아리 COSA<br>
                COSA의 COS는 COmputer Science에서<br>
                A는 Artifical intelligence에서 따왔습니다
                `);
                res.writeHead(200);
                res.end(templateHTML(title, readCSS(), img, topic_item, ""));
            }
            else if (queryData.id === 'EVENT') {
                title += `${queryData.id}`;
                topic_item.push("임시창");
                res.writeHead(200);
                res.end(templateHTML(title, readCSS(), img, topic_item, ""));
            }
            else if (queryData.id === 'STUDY') {
                title += `${queryData.id}`;
                settopic('study_items');
                res.writeHead(200);
                res.end(templateHTML(title, readCSS(), img, topic_item, ""));
            }
            else if (queryData.id === 'UPDATE') {
                title += `${queryData.id}`;
                settopic('update_items');
                res.writeHead(200);
                res.end(templateHTML(title, readCSS(), img, topic_item, ""));
            }
            else if (queryData.id === undefined) {
                res.writeHead(302, { location: `/?id=HOME` });
                res.end();
            } else {
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
