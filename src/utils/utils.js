const puppeteer = require("puppeteer");
const {gamerInfoDataList} = require("../data/gamerInfoJson")
function getAfreecaInfo() {
    console.time("getAfreecaInfo");
  return new Promise(async (resole, reject) => {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
      const page = await browser.newPage();
      await page.goto("https://www.afreecatv.com/");
      for (let i = 0; i < 45; i++) {
        await page.waitForXPath("//div[@class='btn-more']/button");
        const some = await page.$x("//div[@class='btn-more']/button");
        await some[0].evaluate((b) => b.click());
        await sleep(100);
      }
      await sleep(3000);
      const idList = await page.$x("//div[@id='broadlist_area']/ul/li//div[@class='cBox-info']/div/a");
      const titleList = await page.$x("//div[@id='broadlist_area']/ul/li//div[@class='cBox-info']/h3/a");
      const viewersList = await page.$x("//div[@id='broadlist_area']/ul/li//div[@class='cBox-info']/div/span/em");
      const imgList = await page.$x("//div[@id='broadlist_area']/ul/li//div[@class='thumbs-box']/a");

      console.log("idList", idList.length, "titleList", titleList.length, "imgList", imgList.length);

      if (![idList.length, titleList.length, imgList.length].every((v, i, a) => v === a[0])) {
        throw new Error("idList,titleList,imgList length 불일치");
      }
      let afreecaInfo = {};
      let idArr = [];
      let titleArr = [];
      let imgArr = [];
      let viewersArr = [];
      for (const iterator of idList) {
        const id = await iterator.evaluate((el) => el.getAttribute("user_id"));
        idArr.push(id);
      }
      for (const iterator of titleList) {
        const title = await iterator.evaluate((el) => el.getAttribute("title"));
        titleArr.push(title);
      }
      for (const iterator of viewersList) {
        const viewers = await iterator.evaluate((el) => el.textContent);
        viewersArr.push(viewers);
      }
      for (const iterator of imgList) {
        let img = "";
        try {
          const elem = await iterator.$("img");
          if (!elem) {
            img = await iterator.evaluate((el) => el.textContent);
          } else {
            img = await elem.evaluate((el) => el.getAttribute("src"));
          }
        } catch {
          img = await iterator.evaluate((el) => el.textContent);
        }
        imgArr.push(img);
      }
      for (let i = 0; i < idArr.length; i++) {
        afreecaInfo = {
          ...afreecaInfo,
          [idArr[i]]: [titleArr[i], imgArr[i], viewersArr[i]],
        };
      }
      let result = {};
      for (const gamer in gamerInfoDataList) {
        const bjID = gamerInfoDataList[gamer]["bjID"];
        if (bjID in afreecaInfo) {
          result = {
            ...result,
            [gamer]: {
              title: afreecaInfo[bjID][0],
              imgPath: afreecaInfo[bjID][1],
              viewers: afreecaInfo[bjID][2],
              bjID,
            },
          };
        }
      }
      console.timeEnd("getAfreecaInfo");
      resole(result);
    } catch (error) {
      reject("getAfreecaInfo에러: " + error);
    } finally {
      browser.close();
    }
  });
}

function sleep(ms) {
    return new Promise((res) => {
        setTimeout(() => {
            res();
        }, ms);
    });
}

module.exports = {getAfreecaInfo,sleep}