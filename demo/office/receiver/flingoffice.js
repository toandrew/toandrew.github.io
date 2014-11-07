// External namespace for cast specific javascript library
var fling = window.fling || {};

// Anonymous namespace
(function() {
  'use strict';

  FlingOffice.PROTOCOL = 'urn:x-cast:com.infthink.cast.demo.office';

  /**
   * Creates a FlingOffice object.
   * @param {board} board an optional game board.
   * @constructor
   */
  function FlingOffice(board) {
    var self = this;

    this.mBoard = board;


    console.log('********FlingOffice********');

    var channelId = guid();

    this.receiverDaemon = new ReceiverDaemon();
    this.receiverDaemon.on("opened", function(){
         var wsAddress = "ws://"+ receiverDaemon.localIpAddress+":9439/channels/" + channelId;
         console.info("-------------------------------------> player ws addr: ", wsAddress);
         receiverDaemon.send({"type":"additionaldata","additionaldata":{ "serverId": wsAddress}});
     });

     //start Receiver Daemon
     receiverDaemon.open();

     /*
      * Create MessageChannel Obejct
      **/
    var channel = new MessageChannel(channelId);
    channel.on("message", function(senderId, messageType, message) {
        var messageData = JSON.parse(message.data);
        console.info("=================================channel message messageData: ", senderId, messageType, message, messageData);

         switch (messageType) {
             case "senderConnected":
             case "senderDisconnected":
                break;
             case "message":
                break;
         }

         ("onmessage" in self)&&self.onmessage(message);
    });
  }

  // Adds event listening functions to FlingOffice.prototype.
  FlingOffice.prototype = {

    /**
     * ready to fling pdf files
     */
    onFlingPdf: function(senderId, message) {
        console.log('****flingPdf: senderId:' + senderId + ' msg:' + JSON.stringify(message));
        this.mBoard.loadPdf(message.file);
    },

    /**
     * Sender Connected event
     * @param {event} event the sender connected event.
     */
    onSenderConnected: function(event) {
        console.log('onSenderConnected. Total number of senders: ');
    },

    /**
     * Sender disconnected event; if all senders are disconnected,
     * closes the application.
     * @param {event} event the sender disconnected event.
     */
    onSenderDisconnected: function(event) {
        console.log('onSenderDisconnected. Total number of senders: ');
    },

    /**
     * Message received event; determines event message and command, and
     * choose function to call based on them.
     * @param {event} event the event to be processed.
     */
    onMessage: function(event) {
        console.log('********onMessage********' + event);
        /*
        var message = event.data;
        var senderId = event.senderId;

        if (message.command == 'show') {
            this.onShow(senderId, message);
        } else if (message.command == 'leave') {
            this.onLeave(senderId);
        } else if (message.command == 'page') {
            this.onPage(senderId, message);
        } else {
            console.log('Invalid message command: ' + message.command);
        }
        */
    },

    onShow: function(senderId, message) {
        this.onFlingPdf(senderId, message);
    },

    onLeave: function(senderId) {
        console.log('****OnLeave****');
    },

    onPage: function(senderId, message) {
        console.log('****onPage****');
        if (message.cmd == 1) {   // up 
            console.log('****onPage: up!' + document.body.scrollHeight);
            this.mBoard.goPrevious();
        } else if (message.cmd == 2) { //down
            console.log('****onPage: down!' + document.body.scrollHeight);
            this.mBoard.goNext();
        }
    },

    sendError: function(senderId, errorMessage) {
        this.flingMessageBus_.send(senderId, {
          'event': 'error',
          'message': errorMessage });
    },

    /**
     * Broadcasts a message to all of this object's known channels.
     * @param {Object|string} message the message to broadcast.
     */
    broadcast: function(message) {
        this.flingMessageBus_.broadcast(message);
    }

  };

  // Exposes public functions and APIs
  fling.FlingOffice = FlingOffice;
})();