module.exports = {
  testModule: {
    files: [{
      expand:       true,
      dot:          false,
      filter:       'isFile',
      cwd:          './tests/unit/',
      dest:         './modules/',
      src:          [
        'test-module/**/*'
      ]
    }]
  }
};
