# homebridge-flux-led

Homebridge platform plugin for Flux WiFi LED light bulbs which uses the Python package [flux_led](https://github.com/Danielhiversen/flux_led) to communicate.

## Development

To develop this plugin without messing up your current homebridge installation you can use [Docker](https://www.docker.com). Build the Docker container with `docker build -t homebridge .`.

Afterwards you can run an interactive docker container for testing your plugin. To start this container type `docker run -it --rm -v /path/to/homebridge-flux-led/config:/root/.homebridge -v /path/to/homebridge-flux-led:/root/homebridge-flux-led homebridge`.

You should be inside a shell inside your container and can run homebridge in debug mode and the path to the plugin with `homebridge -D -P homebridge-flux-led`.
