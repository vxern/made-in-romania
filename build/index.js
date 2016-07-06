"use strict";

const madeIn = require("made-in")
    , languages = require("./languages")
    , oneByOne = require("one-by-one")
    , bindy = require("bindy")
    , rJson = require("r-json")
    , wJson = require("w-json")
    , packPath = require("package-json-path")
    ;

oneByOne(bindy(languages, (cLang, done) => {
    console.log(`Fetching ${cLang} projects.`);
    madeIn("Romania", {
        token: process.env.GH_TOKEN
      , language: cLang
    }, (err, repos) => {
        if (err) { return done(err); }
        console.log(`Fetced ${repos.length} projects. Waiting 60 seconds.`);
        let left = 60
          , interval = setInterval(() => {
                --left;
                console.log(left);
            }, 1000)
          ;

        setTimeout(() => {
            clearInterval(interval);
            done(null, { lang: cLang, repos: repos });
        }, 60 * 1000);
    });
}), (err, data) => {
    if (err) { return console.error(err); }
    let result = [
    ];
    data.forEach(c => {
        result.push({ h3: c.lang });
        result.push({
            ul: c.repos.map(cRepo => {
                let info = [
                    `[**@${cRepo.owner.login}**](${cRepo.owner.html_url})/[**${cRepo.name}**](${cRepo.html_url})`
                  , cRepo.description || ""
                  , cRepo.homepage || ""
                  , `${cRepo.stargazers_count} :star2:`
                ]
                return `${info[3]} ${info[0]}${info[1] ? "—" + info[1] : ""} cRepo.homepage`;
            })
        });
    });

    let pack = packPath(`${__dirname}/../`)
      , packObj = rJson(pack)
      ;

    packObj.blah.description = result;

    wJson(pack, packObj);
});