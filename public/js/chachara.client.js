Chachara.Client = function(options) {
  options || (options ={});
  this.initialize(options);
};

_.extend(Chachara.Client.prototype, Backbone.Events, {
  initialize: function(options) {
    _.bindAll(this, "bindEvents");

    this.options = options;
    this.sessionCookie = null;

    this.socket = new io.Socket(options.host, { secure: options.secure, port: options.port});
    this.bindEvents();
    this.socket.connect();
  },

  bindEvents: function() {
    var self = this;

    self.log("Connecting...");

    this.socket.on('connect', function() {
      self.log("Connected...");
      self.reconnect();
    });

    // TODO
    // This shouldn't actually redirect to the signin view but to a 'lost con-
    // nection to the server' page.
    this.socket.on('disconnect', function() {
      self.log("Disconnected...");
      self.trigger('disconnect');
    });

    this.socket.on('message', function(message) {
      self.trigger(message.type, message);
    });
  },

  log: function(msg) {
    console.log("[WS] " + msg);
  },

  authenticate: function(creds) {
    var data = creds;
    data.type = "auth";
    data.sid  = this.sessionCookie;

    this.send(data);
  },

  join: function(room) {
    var data = {
      type: "join-room",
      room: room
    };
    this.send(data);
    this.trigger("join-room", {room:room});
  },

  leave: function(room) {
    var data = {
      type: "leave-room",
      room: room
    };
    this.send(data);
    this.trigger("leave-room", {room:room});
  },

  leaveChat: function(jid) {
    var data = {
      type: "leave-chat",
      to: jid
    };
    this.send(data);
    this.trigger("leave-chat", {to:jid});
  },

  reconnect: function() {
    if (!this.sessionCookie) {
      this.sessionCookie = this.getCookie(this.options.sid);
    }

    var data = {
      type: 'connect',
      sid: this.sessionCookie
    };

    this.send(data);
  },

  disconnect: function() {
    var data = {
      type: 'disconnect',
    };

    this.send(data);
    this.trigger("auth-not-ok", {});
  },

  send: function(data) {
    this.socket.send(data);
  },

  // Not sure where to put it.
  getCookie: function (name) {
    var cookies = document.cookie.split(";");
    for (i = 0; i < cookies.length; i++) {
      x = cookies[i].substr(0, cookies[i].indexOf("="));
      y = cookies[i].substr(cookies[i].indexOf("=") + 1);
      x = x.replace(/^\s+|\s+$/g, "");
      if (x == name) {
        return unescape(y);
      }
    }
  }
});
