'use strict';

var mqtt = require('mqtt');

module.exports = function (RED) {

    function LiberiotNode(config) {

        RED.nodes.createNode(this, config);

        var node = this;


        node.status({ fill: "red", shape: "dot", text: "Not connected" });

        this.client = mqtt.connect('mqtt://mqtt.liberiot.org:3001');

        this.client.on('connect', subscribeLiberiot);
        this.client.on('message', parseMessage);

        function subscribeLiberiot() {

            if (config.mqttSub) {
                node.client.subscribe(config.mqttSub, null, function () {
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
            node.client.publish(config.mqttPub + '/' + message.payload);
        });
    }

    RED.nodes.registerType("liberiot", LiberiotNode);

    LiberiotNode.prototype.close = function () {
        if (this.client) {
            this.client.end();
        }
    }
};