'use strict';

var convert = require('color-convert');

var Characteristic, Service;

module.exports = function (homebridge) {
  console.log("homebridge API version: " + homebridge.version);

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory('homebridge-flux-led', 'FluxLED', FluxLEDAccessory, false);
};

function FluxLEDAccessory(log, config) {
  this.log = log;
  this.config = config;
  this.name = config.name || 'LED Controller';
  this.setup = config.setup || 'RGBW';
  this.port = config.port || 5577;
  this.ip = config.ip;
  this.color = {
    H: 255,
    S: 100,
    L: 50
  };
  this.brightness = 100;
  this.purewhite = config.purewhite || false;

  this.getColorFromDevice();

}

FluxLEDAccessory.prototype.identify = function (callback) {
  this.log('Identify requested!');
  callback();
};

FluxLEDAccessory.prototype.getServices = function () {
  var informationService = new Service.AccessoryInformation();

  informationService
    .setCharacteristic(Characteristic.Manufacturer, 'ACME Ltd.')
    .setCharacteristic(Characteristic.Model, 'LED-controller')
    .setCharacteristic(Characteristic.SerialNumber, '123456789');

  var lightbulbService = new Service.Lightbulb(this.name);

  lightbulbService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getPowerState.bind(this))
    .on('set', this.setPowerState.bind(this));

  lightbulbService
    .addCharacteristic(new Characteristic.Hue())
    .on('get', this.getHue.bind(this))
    .on('set', this.setHue.bind(this));

  lightbulbService
    .addCharacteristic(new Characteristic.Saturation())
    .on('get', this.getSaturation.bind(this))
    .on('set', this.setSaturation.bind(this));

  lightbulbService
    .addCharacteristic(new Characteristic.Brightness())
    .on('get', this.getBrightness.bind(this))
    .on('set', this.setBrightness.bind(this));

  return [informationService, lightbulbService];

};

// MARK: - UTIL

FluxLEDAccessory.prototype.sendCommand = function (command, callback) {
  var exec = require('child_process').exec;
  var cmd = 'python -m flux_led ' + this.ip + ' ' + command;
  exec(cmd, callback);
};

FluxLEDAccessory.prototype.getState = function (callback) {
  this.sendCommand('-i', function (error, stdout) {
    var settings = {
      on: false,
      color: {
        H: 255,
        S: 100,
        L: 50
      }
    };

    var colors = stdout.match(/\(\d{3}\, \d{3}, \d{3}\)/g);
    var isOn = stdout.match(/\] ON /g);

    if (isOn && isOn.length > 0) settings.on = true;
    if (colors && colors.length > 0) {
      var converted = convert.rgb.hsl(stdout.match(/\d{3}/g));
      settings.color = {
        H: converted[0],
        S: converted[1],
        L: converted[2],
      };
    }

    callback(settings);

  });
};

FluxLEDAccessory.prototype.getColorFromDevice = function () {
  this.getState(function (settings) {
    this.color = settings.color;
    this.log("DEVICE COLOR: %s", settings.color.H + ',' + settings.color.S + ',' + settings.color.L);
  }.bind(this));
};

FluxLEDAccessory.prototype.setToCurrentColor = function () {
  var color = this.color;

  if (color.S == 0 && color.H == 0 && this.purewhite) {
    this.setToWarmWhite();
    return
  }

  var brightness = this.brightness;
  var converted = convert.hsl.rgb([color.H, color.S, color.L]);

  var base = '-x ' + this.setup + ' -c';
  this.sendCommand(base + Math.round((converted[0] / 100) * brightness) + ',' + Math.round((converted[1] / 100) * brightness) + ',' + Math.round((converted[2] / 100) * brightness));
};

FluxLEDAccessory.prototype.setToWarmWhite = function () {
  var brightness = this.brightness;
  this.sendCommand('-w ' + brightness);
};

// MARK: - POWERSTATE

FluxLEDAccessory.prototype.getPowerState = function (callback) {
  this.getState(function (settings) {
    callback(null, settings.on);
  });
};

FluxLEDAccessory.prototype.setPowerState = function (value, callback) {
  this.sendCommand(value ? '--on' : '--off', function () {
    callback();
  });
};


// MARK: - HUE

FluxLEDAccessory.prototype.getHue = function (callback) {
  var color = this.color;
  callback(null, color.H);
};

FluxLEDAccessory.prototype.setHue = function (value, callback) {
  this.color.H = value;
  this.setToCurrentColor();
  this.log("HUE: %s", value);

  callback();
};

// MARK: - BRIGHTNESS

FluxLEDAccessory.prototype.getBrightness = function (callback) {
  var brightness = this.brightness;
  callback(null, brightness);
};

FluxLEDAccessory.prototype.setBrightness = function (value, callback) {
  this.brightness = value;
  this.setToCurrentColor();
  this.log("BRIGHTNESS: %s", value);
  callback();
};

// MARK: - SATURATION

FluxLEDAccessory.prototype.getSaturation = function (callback) {
  var color = this.color;
  callback(null, color.S);
};

FluxLEDAccessory.prototype.setSaturation = function (value, callback) {
  this.color.S = value;
  this.setToCurrentColor();
  this.log("SATURATION: %s", value);

  callback();
};
