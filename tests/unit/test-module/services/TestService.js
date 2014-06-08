module.exports = function ( Service, TestModel ) {
    return Service.extend({
        model: TestModel
    });
};