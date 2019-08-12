from flux_led import WifiLedBulb
from pyhap.accessory import Accessory
from pyhap.const import CATEGORY_LIGHTBULB


class FluxLED(Accessory):
    category = CATEGORY_LIGHTBULB

    def __init__(self, driver, display_name, ip, logger=None):
        super().__init__(driver, display_name)
        self.logger = logger

        self._wifi_bulb = WifiLedBulb(ip)

        service = self.add_preload_service(
            'Lightbulb',
            chars=[
                'On',
                'Brightness',
                'Hue',
                'Saturation',
            ]
        )

        # configure callbacks
        service.configure_char(
            'On',
            setter_callback=self.set_on,
        )
        # Set our instance variables
        self.on = 0

    def __getstate__(self):
        state = super().__getstate__()
        return state

    def set_on(self, value):
        if self.logger:
            self.logger.debug(f'Set On: {value}')
        self.on = value
        if value == 1:
            self._wifi_bulb.turnOn()
        elif value == 0:
            self._wifi_bulb.turnOff()
