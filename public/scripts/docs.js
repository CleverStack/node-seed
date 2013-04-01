//js vitalime/scripts/doc.js

load('steal/rhino/rhino.js');
steal("documentjs").then(function(){
	DocumentJS('vitalime/vitalime.html', {
		markdown : ['vitalime']
	});
});