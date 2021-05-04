//Title
//total videos
//actual videos
//views
//total watchtime

const puppeteer = require("puppeteer");
let page;
async function fn() {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"],
        });
        let pages = await browser.pages();
        
        page = pages[0];
        await page.goto(
            "https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq"
        );
        await page.waitForSelector(
            "#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer",
            { visible: true }
        );
        await page.waitForSelector("h1#title", { visible: true });
        let obj = await page.evaluate(function () {
            let allElems = document.querySelectorAll(
                "#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer"
            );
            let noOfVideos = allElems[0].innerText;
            let noOfViews = allElems[1].innerText;
            let playTitle = document.querySelector("h1#title").innerText;
            return { playTitle, noOfVideos, noOfViews };
        });

        let numVideos = obj.noOfVideos.split(" ")[0];
        numVideos = Number(numVideos);
        console.log(numVideos);

        let i = 0;
        while(i==(numVideos/100)){
            scrollDown(page);
            i++;
        }

        // let videoTitle = "a#video-title";
        // let duration = "span.style-scope.ytd-thumbnail-overlay-time-status-renderer";
        // await page.waitForSelector(videoTitle,{visible: true});
        // await page.waitForSelector(duration,{visible: true});
        // let videos = await page.evaluate(getTitleDur,videoTitle,duration);        
        // console.table(videos);
    }catch(err){
        console.log(err);
    }
}
function getTitleDur(vs,ds){
    let videos = [];
    let videoTitles = document.querySelectorAll(vs);
    let videoTime = document.querySelectorAll(ds);
    for(let i = 0 ; i < videoTime.length ; i++){
        let title = videoTitles[i].innerText;
        let time = videoTime[i].innerText;
        videos.push({title,time});
    }
    return videos;
}
fn();
