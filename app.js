/*
##################################################
 Created on: 1st Feb, 2020
 Author: Isaac Wambugu
 Simple program to create string xmls for the android app.
 Creating the string xml for the Timby android app.
 This task can be tedious and time consuming but this program will help with this.
 Enjoy!
################################################### 
 */
const ExcelJS = require('exceljs');
const fs = require('fs');
const makeDir = require('make-dir');

readCSVFile().then((data) => {
    var i;
    for (i = 2; i <= data.languageCount; i++) {

        console.log("\n\n-------------------------\n");
        console.log("\nLanguage: "+ data.languageNames[i]);
        console.log("\nLanguage Code: "+ data.languageCodes[i]);
        console.log("\nMissing translation Count: "+ data.missingTranslations[i]);
        console.log("\nMissing translations: "+ data.missingRowNumbers[i]);

        writeXMLDataToFile(data.languageCodes[i], xmlBodyGenerator(data.xmlData[i]));

    }
    console.log("\n\n-------------------------\n\n");
    console.log("The String xmls are ready!");
    process.exit(0);
}).catch((err) => {
    console.log("Houston we have a problem!");
    console.log(err);
})

function readCSVFile() {
    return new Promise((resolve, reject) => {
        var languageCodes = {};
        var languageNames = {};
        var xmlData = {};
        var missingRowNumbers = {};
        var missingTranslationCount = {};
        var workbook = new ExcelJS.Workbook();
        workbook.csv.readFile("./input/input.csv")
            .then(worksheet => {

                var columnCount = worksheet.actualColumnCount - 1;
                var rowCount = worksheet.actualRowCount;
                //loop through each row of the excel file
                worksheet.eachRow(function (row, rowNumber) {
                    var stringIdentifier;
                    var translations;
                    var i;

                    for (i = 2; i <= columnCount; i++) {

                        if (rowNumber == 1) {
                            languageNames[i] = row.getCell(i).value;
                            missingRowNumbers[i] = "["

                        } else if (rowNumber == 2) {
                            languageCodes[i] = row.getCell(i).value;
                            missingTranslationCount[i] = 0;
                            
                        }else  {

                            stringIdentifier = row.getCell(1).value;
                            if (stringIdentifier.match('<!--')) {
                                xmlData[i] = xmlData[i] + '\n\n\t' + stringIdentifier;
                            } else {

                                translations = row.getCell(i).value;
                                if (translations === null) {
                                    missingRowNumbers[i] = missingRowNumbers[i]+ String(rowNumber) +" ";
                                    missingTranslationCount[i]++;
                                } else {                        
                                    //translations = translations.replace(/'/g, "\'");
                                    xmlData[i] = xmlData[i] + '\n\t<string name=\"' + stringIdentifier + '\">' + translations + '<\/string>';

                                    if(rowCount == rowNumber){
                                        missingRowNumbers[i] = missingRowNumbers[i]+ "]";
                                    }
                                }
                            }

                        }
                    }
                });
                
                resolve({ 
                    languageCount: columnCount, 
                    languageCodes: languageCodes, 
                    languageNames: languageNames, 
                    xmlData: xmlData,
                    missingTranslations: missingTranslationCount, 
                    missingRowNumbers: missingRowNumbers});
            });

    })
}
function xmlBodyGenerator(editables) {

    var xmlHeader = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
        "<resources xmlns:xliff=\"urn:oasis:names:tc:xliff:document:1.2\">";
    var xmlConstants = "\n\n\n\t<string name=\"app_name\">TIMBY<\/string>\n" +
        "\t<string name=\"app_name_facebook\">Chat+<\/string>\n" +
        "\t<string name=\"app_name_youtube\">Player Pro<\/string>\n" +
        "\t<string name=\"protocol\">https:\/\/<\/string>\n" +
        "\t<string name=\"timer_format\"><xliff:g id=\"format\">%02d<\/xliff:g>:<xliff:g id=\"format\">%02d<\/xliff:g><\/string>\n" +
        "\t<string name=\"audio_db_title_format\"><xliff:g id=\"format\">yyyy-MM-dd HH:mm:ss<\/xliff:g><\/string>\n" +
        "\t<string name=\"audio_db_artist_name\">Your recordings<\/string>\n" +
        "\t<string name=\"audio_db_album_name\">Audio recordings<\/string>\n" +
        "\t<string name=\"audio_db_playlist_name\">My recordings<\/string>\n" +
        "\t<string name=\"prefDefault_recordType\">audio/aac<\/string>";
    var xmlFooter = "\n</resources>";

    return xmlHeader + editables + xmlConstants + xmlFooter;

}
function writeXMLDataToFile(languageCode, xmlData) {

   // makeDir('/output/'+ languageName);
    let fileName = "string-" + languageCode + ".xml";
    let filepath = "./output/"+ fileName;

    //file path should look like this:
    //output/English/string-en.xml


    try {
        //create the string xml in the output folder 
        fs.writeFileSync(filepath, xmlData, 'utf8');
    } catch (err) {
        console.log("Something went wrong when creating the String xml file");
        console.log(err);
    }
}