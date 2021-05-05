//Title
//total videos
//actual videos
//views
//total watchtime

const puppeteer = require("puppeteer");
let page;
let currVid = 0;
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
        let i = 0;
        while (numVideos - currVid > 100) {
            await scrollDown();
            i++;
            console.log(i);
        }
        await waitTillHTMLRendered(page);
        await scrollDown();
        let videoSelector = "#video-title";
        let duration =
            "span.style-scope.ytd-thumbnail-overlay-time-status-renderer";
        // getTitleNDuration(videoSelector, duration);
        let titleDurArr = await page.evaluate(
            getTitleNDur,
            videoSelector,
            duration
        );
        console.table(titleDurArr);
    } catch (err) {
        console.log(err);
    }
}
async function scrollDown() {
    let videoTitle = "a#video-title";
    await page.waitForSelector(videoTitle, { visible: true });
    let length = await page.evaluate(function () {
        let elems = document.querySelectorAll("a#video-title");
        elems[elems.length - 1].scrollIntoView(true);
        return elems.length;
    });
    currVid = length;
}
function getTitleNDur(vs, ds) {
    let videos = [];
    let videoTitles = document.querySelectorAll(vs);
    let videoTime = document.querySelectorAll(ds);
    for (let i = 0; i < videoTime.length; i++) {
        let title = videoTitles[i].innerText;
        let time = videoTime[i].innerText;
        videos.push({ title, time });
    }
    return videos;
}
async function waitTillHTMLRendered(page, timeout = 30000) {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;

        let bodyHTMLSize = await page.evaluate(
            () => document.body.innerHTML.length
        );

        console.log(
            "last: ",
            lastHTMLSize,
            " <> curr: ",
            currentHTMLSize,
            " body html size: ",
            bodyHTMLSize
        );

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            console.log("Page rendered fully..");
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await page.waitForTimeout(checkDurationMsecs);
    }
}
fn();
