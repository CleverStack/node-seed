module.exports = function (
    app,
    WorkflowController,
    WorkflowStepsController )
{

    app.get('/workflows',                           WorkflowController.attach());
    app.get('/workflows/:id',                       WorkflowController.attach());
    app.post('/workflows',                          WorkflowController.attach());
    app.put('/workflows/:id',                       WorkflowController.attach());
    app[ 'delete' ]('/workflows/:id?',              WorkflowController.attach());

    app.all('/workflows/:workflowId/steps/:id?',    WorkflowStepsController.attach());
    app.all('/workflows/:workflowId/steps/?',       WorkflowStepsController.attach());

};