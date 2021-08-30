const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const app = express();

app.use(cors()); // enable CORS

let port = process.env.PORT || 5000;

let db = [];

app.all("/", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get("/", (req, res) => {
    res.send(
        "This API crawled from https://tiemchungcovid19.gov.vn/portal. Add /all to the current URL to get vaccination data",
        
    );
});

app.get("/all", (req, res) => {
    const puppeteerRuner = async () => {
        const browser = await puppeteer.launch({

            args: ["--no-sandbox", "--disabled-setupid-sandbox"],
        });
        const page = await browser.newPage();

        await page.goto("https://tiemchungcovid19.gov.vn", {
            waitUntil: "load",
            timeout: 0, // remove the timeout
        });



        const data = await page.evaluate(() => {


            const table = document.querySelectorAll("table ")[0];
    
            // click the View more button before to get all table data
            const viewMoreButton = document.querySelectorAll("button")[30];
            console.log("viewMoreButton: ", viewMoreButton);
            viewMoreButton.click();

            const tableBody = Array.from(
                table.querySelectorAll("tbody tr")
            ).map((tr) => {
                const rows = Array.from(tr.querySelectorAll("td")).map(
                    (td) => td.innerText
                );
                return {
                    id: rows[0],
                    province: rows[1],
                    expected: rows[2],
                    real: rows[3],
                    population18: rows[4],
                    injection: rows[5],
                    expectedRate: rows[6],
                    injectionRate: rows[7],
                    injection1Rate: rows[8],
                };
            });

            return tableBody;
        });
        console.log(data);

        db = data;
        res.json(db);

        await browser.close();
    };
    if (db.length > 0 && db.constructor === Array) res.json(db);
    else {
        puppeteerRuner();
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
