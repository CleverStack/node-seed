module.exports = {
  api: {
    options: {
      indexes: true
    },
    files: [
      {
        src: ['./lib/classes/Class.js'],
        dest: 'docs/api/classes/Class.md',
      },
      {
        src: ['./lib/classes/Module.js'],
        dest: 'docs/api/classes/Module.md',
      },
      {
        src: ['./node_modules/clever-controller/controller.js'],
        dest: 'docs/api/classes/CleverController.md',
      },
      {
        src: ['./lib/classes/Controller.js'],
        dest: 'docs/api/classes/Controller.md',
      },
      {
        src: ['./lib/classes/Service.js'],
        dest: 'docs/api/classes/Service.md',
      },
      {
        src: ['./lib/classes/Model.js'],
        dest: 'docs/api/classes/Model.md',
      },
      {
        src: ['./lib/classes/ModuleLoader.js'],
        dest: 'docs/api/classes/ModuleLoader.md',
      },
      {
        src: ['./lib/classes/Validator.js'],
        dest: 'docs/api/classes/Validator.md'
      }
    ]
  }
};
