module.exports = function ( Controller, TestObjectService ) {
    return Controller.extend(
    {
        autoRouting: true,
        service: TestObjectService
    },
    {

    });
};