'use strict';

var TelegramBot = require('node-telegram-bot-api');
var TOKEN = '357262132:AAEVZirSvU6UJ0uEF00Yx_rDOj6HaXnRWWs';
var bot = new TelegramBot(TOKEN, {polling: true});
var request = require('request');

bot.onText(/все плохо/, function (msg, match) {
  var user_id = msg.from.id;

  // options for location btn
  var btn_options = {
    parse_mode: "Markdown",
    reply_markup: {
      one_time_keyboard: true,
      keyboard: [
        [{
          text: 'Share your geoposition',
          request_location: true
        }]
      ]
    }
  };
  var location_question = 'Где ты сейчас?';
  bot.sendMessage( msg.chat.id, location_question, btn_options ).then(function() {
    locationRequest();
  });
});


function locationRequest() {
  bot.once('location', function(msg) {
    var location = {
      longitude: msg.location.longitude,
      latitude: msg.location.latitude
    };

    // request to 2gis catalog
    var request_str = `http://catalog.api.2gis.ru/search?what=bar&point=${location.longitude},${location.latitude}&radius=1000&version=1.3&key=rutnpt3272`;
    request.get(request_str, function(error, response, body){
      var data = JSON.parse(body);

      if (data.length) {
        bot.sendMessage(user_id, `У меня отличный план`).then(function () {
          bot.sendMessage(user_id, `Вот список баров рядом с тобой.`).then(function () {
            data.result.forEach(function (r) {
              bot.sendMessage(user_id, `Название: ${r.name}, Адрес: ${r.address}`);
            })
          })
        })
      } else {
        bot.sendMessage(user_id, 'К сожалению рядом с тобой нет ни одного бара. Держись.');
      }
    });
  });
}