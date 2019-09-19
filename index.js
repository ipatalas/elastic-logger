function createLogger(project, appName) {
	const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST;
	const ELASTICSEARCH_AUTH = process.env.ELASTICSEARCH_AUTH;

	if (!ELASTICSEARCH_HOST) {
		console.error("Missing ELASTICSEARCH_HOST environment variable");
		process.exit(1);
	}

	var bunyan = require('bunyan');
	var Elasticsearch = require('bunyan-elasticsearch');

	var esStream = new Elasticsearch({
		host: ELASTICSEARCH_HOST,
		httpAuth: ELASTICSEARCH_AUTH || ''
	});

	esStream.on('error', err => console.error('Elasticsearch Stream Error:', err.stack));

	const logger = bunyan.createLogger({
		name: project,
		streams: [
			{ stream: process.stdout },
			{ stream: esStream }
		],
		serializers: bunyan.stdSerializers
	})

	if (appName) {
		return logger.child({
			'app-name': appName
		});
	}

	return logger;
}

module.exports = createLogger;