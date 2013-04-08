// load('scripts/crawl.js')

load('steal/rhino/rhino.js')

steal('steal/html/crawl', function(){
  steal.html.crawl("index.html#!home",{
  	out: 'public/out'
  	// browser: 'phantomjs'
  });
});
