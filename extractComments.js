// Author : Bhavya Mehta

const puppeteer = require("puppeteer");

const getCommentsFromPost = async (email, password, postLink) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath:
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  });
  const page = await browser.newPage();
  await page.goto("https://www.linkedin.com/login");
  await page.waitForSelector('input[name="session_key"]');
  await page.type('input[name="session_key"]', email);
  await page.waitForSelector('input[name="session_password"]');
  await page.type('input[name="session_password"]', password);
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');
  const cookies = await page.cookies();
  const page2 = await browser.newPage();
  await page2.setCookie(...cookies);
  await page2.goto(postLink);
  await page.close();
  const buttonText = [];
  buttonText[0] = "";
  while (1) {
    try {
      await page2.waitForSelector("button[data-control-name='more_comments']", {
        timeout: 5000,
      });
      const buttonText = await page2.$$eval(
        "button[data-control-name='more_comments']",
        (am) => am.filter((e) => e.innerText).map((e) => e.innerText)
      );
      if (buttonText[0] === "Load more comments") {
        await page2.click("button[data-control-name='more_comments']");
      } else {
        break;
      }
    } catch (err) {
      if (err) {
        break;
      }
    }
  }

  const buttonReplyText = [];
  buttonReplyText[0] = "";
  while (1) {
    try {
      await page2.waitForSelector("button[data-control-name='more_replies']", {
        timeout: 5000,
      });
      const buttonReplyText = await page2.$$eval(
        "button[data-control-name='more_replies']",
        (am) => am.filter((e) => e.innerText).map((e) => e.innerText)
      );
      if (buttonReplyText[0].split("\n")[0] === "Load previous replies") {
        await page2.click("button[data-control-name='more_replies']");
      } else {
        break;
      }
    } catch (err) {
      if (err) {
        break;
      }
    }
  }

  await page2.waitForSelector("h3.comments-post-meta__actor");
  const actorSelector = "h3.comments-post-meta__actor";
  const getActors = await page2.$$eval(actorSelector, (am) =>
    am.filter((e) => e.innerText).map((e) => e.innerText)
  );
  await page2.waitForSelector(
    "div.comments-comment-item__inline-show-more-text"
  );
  const selector = "div.comments-comment-item__inline-show-more-text";
  const getComments = await page2.$$eval(selector, (am) =>
    am.filter((e) => e.innerText).map((e) => e.innerText)
  );
  await page2.close();
  await browser.close();
  commentsArray = getComments.map((item, index) => {
    return { actor: getActors[index], comment: item };
  });
  const csvjson = require("csvjson");
  const writeFile = require("fs").writeFile;
  const csvData = csvjson.toCSV(commentsArray, {
    headers: "key",
  });
  writeFile("./commentsData.csv", csvData, (err) => {
    if (err) {
      console.log(err); // Do something to handle the error or just throw it
      throw new Error(err);
    }
    console.log("Success!");
  });
};

getCommentsFromPost(
  "abc@xyz.com",
  "password",
  "https://www.linkedin.com/posts/garyvaynerchuk_two-wrongs-dont-make-a-right-stop-combating-activity-6659214925354844162-idtJ/"
); //Please enter valid mailID, password and postlink here
