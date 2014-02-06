module.exports = function (
    app,
    CsvController )
{
    app.get('/csv/types',           CsvController.attach());
    app.post('/csv/examine',        CsvController.attach());
    app.post('/csv/submitDraft',    CsvController.attach());
    app.post('/csv/submitFinal',    CsvController.attach());

};