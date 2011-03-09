var Chachara = {
  run: function() {
    var client = new Chachara.Client({
      host: "127.0.0.1", 
      port: 8080
    });

    client.bind("connect", function() {
      new Chachara.Application({client:client});
      Backbone.history.start();
    });
  }
}
