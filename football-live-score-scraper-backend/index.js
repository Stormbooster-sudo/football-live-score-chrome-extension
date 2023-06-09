const express = require('express');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
//in window use command ' SET NODE_ENV = ....... ' then 'node index.js'
//in linux use command ' NODE_ENV=...... node index.js '
const puppetCfg = process.env.NODE_ENV == "production" ? { headless: 'new', executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] } : {headless: 'new'};

const cors = require('cors');
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());

app.post("/get-data", async (req, res) => {
    const date = req.body.date
    puppeteer.launch(puppetCfg).then(async browser => {
        // console.log(date)
        const page = await browser.newPage();
        await page.goto(`https://www.goal.com/en/fixtures/${date}`);
        await page.waitForSelector('.competition_name__YEMb_');
        const data = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.competition_competition__s2ULZ'), e => ({
                league: e.querySelector('.competition_name__YEMb_').innerText,
                league_link: e.querySelector('.competition_name__YEMb_').href,
                league_logo: e.querySelector('.competition_logo-wrapper__WNYqb .competition_logo__1QOg2').getAttribute('src'),
                match: Array.from(e.querySelectorAll('.row_row__UQmGm'), e => ({
                    match_link: e.querySelector('a').href,
                    time: e.querySelector('.start-date_start-date__ggx17') ? e.querySelector('.start-date_start-date__ggx17').innerText : e.querySelector('.period_period__OUtPk') ? e.querySelector('.period_period__OUtPk').innerText : e.querySelector('.full-time_full-time__RAWhq') ? "FT" : "HT",
                    home: e.querySelector('.team_team___lVK_.team_team-a__2YS_9 .name_name__YzgHa').innerText,
                    home_logo: e.querySelector('.team_team___lVK_.team_team-a__2YS_9 .crest_crest__CNBqh').getAttribute('src'),
                    home_score: e.querySelector('.result_score__Dh4zx .result_team-a__A4z1T') ? e.querySelector('.result_score__Dh4zx .result_team-a__A4z1T').innerText : "",
                    away: e.querySelector('.team_team___lVK_.team_team-b__YaeU1 .name_name__YzgHa').innerText,
                    away_logo: e.querySelector('.team_team___lVK_.team_team-b__YaeU1 .crest_crest__CNBqh').getAttribute('src'),
                    away_score: e.querySelector('.result_score__Dh4zx .result_team-b__SPZhO') ? e.querySelector('.result_score__Dh4zx .result_team-b__SPZhO').innerText : "",
                }))
            }))
        );
        res.json(data);
        await browser.close();
    })
});
app.listen(4231);