function createLogger(project, appName) {
    const FILEBEAT_HOST = process.env.FILEBEAT_HOST;
    const FILEBEAT_PORT = process.env.FILEBEAT_PORT;

    if (!FILEBEAT_HOST) {
        console.error('Missing FILEBEAT_HOST environment variable');
        process.exit(1);
    }

    var bunyan = require('bunyan');

    const logger = bunyan.createLogger({
        name: project,
        streams: [
            { stream: process.stdout },
            createFileBeatStream(FILEBEAT_HOST, FILEBEAT_PORT)
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

function createFileBeatStream(host, port) {
    const bunyantcp = require('bunyan-logstash-tcp');

    return {
        type: 'raw',
        stream: bunyantcp.createStream({ host, port })
    };
}