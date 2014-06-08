module.exports = function ( Service, TestObjectModel ) {
    return Service.extend({
        model: TestObjectModel
    });
};