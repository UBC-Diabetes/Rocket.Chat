Package.describe({
	name: 'rocketchat:tech-support-monitor',
	version: '1.0.0',
	summary: 'Monitors and duplicates messages sent to tech_support user into team channel',
	git: ''
});

Package.onUse(function(api) {
	api.versionsFrom('1.3');
	
	api.use([
		'ecmascript',
		'rocketchat:callbacks',
		'rocketchat:models',
		'rocketchat:settings'
	]);

	// Server files
	api.addFiles([
		'server/index.js'
	], 'server');
});