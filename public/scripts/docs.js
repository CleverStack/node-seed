//js scripts/doc.js

load('steal/rhino/rhino.js');
steal("documentjs").then(function(){
	DocumentJS('scripts/build.html', {
		markdown : ['ctstub']
	});
});