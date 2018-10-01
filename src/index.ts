import { Client, connect } from "mqtt";
import { Red, Node } from "node-red";

export default (RED: Red) => {
  function LiberiotNode(config) {
    RED.nodes.createNode(this, config);
    const node: Node = this;

    node.status({ fill: "red", shape: "dot", text: "Not connected" });
    const client = connect("mqtt://mqtt.liberiot.org:3001");

    client.on("connect", subscribeLiberiot);
    client.on("message", parseMessage);

    function subscribeLiberiot() {
      if (!config.mqttSub) return;

      client.subscribe(config.mqttSub, null, function() {
        node.status({ fill: "green", shape: "dot", text: "Connected" });
      });
    }

    function parseMessage(topic, message) {
      console.log(config.name + " " + topic + " === " + config.mqttSub);

      if (topic === config.mqttSub) {
        const msg: { payload?: string } = {};
        if (message) {
          msg.payload = JSON.parse(message);
          node.send(msg);
        }
      }
    }

    this.on("input", function(message) {
      console.log(config.mqttPub + "/" + message.payload);
      client.publish(config.mqttPub + "/" + message.payload);
    });

    LiberiotNode.prototype.close = () => {
      if (client) {
        client.end();
      }
    };
  }

  RED.nodes.registerType("liberiot", LiberiotNode);
};
