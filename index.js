function createLogger(project, appName) {
    const FILEBEAT_HOST = process.env.FILEBEAT_HOST;
    const FILEBEAT_PORT = process.env.FILEBEAT_PORT;
    const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST;
    const ELASTICSEARCH_AUTH = process.env.ELASTICSEARCH_AUTH;

    const useFileBeat = !!process.env.FILEBEAT_HOST;

    if (!FILEBEAT_HOST && !ELASTICSEARCH_HOST) {
        console.error('Missing FILEBEAT_HOST/ELASTICSEARCH_HOST environment variable');
        process.exit(1);
    }

    var bunyan = require('bunyan');

    const stream = useFileBeat
        ? createFileBeatStream(FILEBEAT_HOST, FILEBEAT_PORT)
        : createElasticSearchStream(ELASTICSEARCH_HOST, ELASTICSEARCH_AUTH);

    const logger = bunyan.createLogger({
        name: project,
        streams: [
            { stream: process.stdout },
            stream
        ],
        serializers: bunyan.stdSerializers
    });

    if (appName) {
        return logger.child({
            'app-name': appName
        });
    }

    return logger;
}

module.exports = createLogger;

function createElasticSearchStream(host, auth) {
    var Elasticsearch = require('bunyan-elasticsearch');

    var esStream = new Elasticsearch({
        host: host,
        httpAuth: auth || ''
    });

    esStream.on('error', err => console.error('Elasticsearch Stream Error:', err.stack));

    return {
        stream: esStream
    };
}

function createFileBeatStream(host, port) {
    const bunyantcp = require('bunyan-logstash-tcp');

    return {
        type: 'raw',
        stream: bunyantcp.createStream({ host, port })
    };
}