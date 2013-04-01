// load('vitalime/scripts/crawl.js')

load('steal/rhino/rhino.js')

steal('steal/html/crawl', function(){
  steal.html.crawl("vitalime/vitalime.html#!home",{
  	out: 'vitalime/out'
  	// browser: 'phantomjs'
  });
});
