# Elastic-logger

That's a simple wrapper over bunyan logger which makes it easier to log everything from apps I run at home. That's mainly to remove all boilerplate around logging and leave just pure logic:

```JS
const log = require('elastic-logger')('system-name', 'sub-system-name' /* optional */);

log.info('Test log entry');
```

I've got quite some scripts for IoT and stuff and I want them all to log everything to the same place. As a backend ELK stack is used under the hood. 

## Configuration

There are two ways of writing logs either directly to **Elasticsearch** or via **Filebeat** (new lightweight version of **Logstash**).
I've been using the first one for years already but ELK evolved since then. New Beats system seems to be quite tempting but it's all up to you.

### Elasticsearch

Logs will be written to `logstash-YYYY.MM.DD` index. To configure that just make sure those environment variables are available for the logging process:

- **ELASTICSEARCH_HOST**: that's the host and port pointing to your ES instance (*eg. localhost:9200*)
- **ELASTICSEARCH_AUTH** *(optional)*: authentication data in the following format `user:pass`, skip that if your ES instance is open

### Filebeats

Logs will be written to **Filebeat** which by default writes to new `filebeats-*` indexes. This is triggered by other environment variables:

- **FILEBEAT_HOST**: hostname of the **Filebeat**
- **FILEBEAT_PORT**: port **Filebeat** is listening on

**Filebeat** variables take precedence over ES variables so **Filebeat** will be used if both are specified.
For that to work **Filebeat** configuration has to be tweaked a little:

```YAML
filebeat.inputs:
- type: tcp
  max_message_size: 1MiB
  host: "0.0.0.0:1234" # Filebeat TCP listener

processors:
- decode_json_fields: # bunyan sends whole message as JSON string, need to unpack
    when:
      regexp:
        message: '^\{.*\}$'
    fields: ["message"]
    target: ""
    overwrite_keys: true
    add_error_key: true
- drop_fields: # remove field added by bunyan-logstash-tcp library
    fields: ['source']
    ignore_missing: true
    when:
      contains:
        tags: 'bunyan'

output.elasticsearch:
  hosts: 'es01:9200'
  username: '${USER}'
  password: '${PASS}'
```
