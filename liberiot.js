'use strict';

module.exports = function (RED) {
    function LiberiotNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var mqtt = require('mqtt');

        node.status({ fill: "red", shape: "dot", text: "Not connected" });

        var client = mqtt.connect('mqtt://mqtt.liberiot.org:3001', { clientId: config.device + config.endpoint + config.unit + config.name });

        client.on('connect', subscribeLiberiot);
        client.on('message', parseMessage);

        function subscribeLiberiot() {

            if (config.mqttSub) {
                client.subscribe(config.mqttSub, null, function () {
                    node.status({ fill: "green", shape: "dot", text: "Connected" });
                });
            }
        }

        function parseMessage(topic, message) {

            console.log(config.name + ' ' + topic + ' === ' + config.mqttSub);

            if (topic === config.mqttSub) {
                var msg = {};
                if (message) {
                    msg.payload = JSON.parse(message);
                    node.send(msg);
                }
            }
        }

        this.on('input', function (message) {
            console.log(config.mqttPub + '/' + message.payload);
            client.publish(config.mqttPub + '/' + message.payload);
        });
    }

    RED.nodes.registerType("liberiot", LiberiotNode);
};