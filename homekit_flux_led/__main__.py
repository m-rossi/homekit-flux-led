import argparse
from pathlib import Path
import json
import logging

from flux_led import BulbScanner, WifiLedBulb
from pyhap.accessory import Bridge
from pyhap.accessory_driver import AccessoryDriver
from pyhap.util import generate_mac

from .flux_led_accesory import FluxLED


def main():
    # init logger
    logger = logging.getLogger('homekit-flux-led')
    formatter = logging.Formatter('[%(levelname)s %(asctime)s]: %(message)s')
    ch = logging.StreamHandler()
    ch.setFormatter(formatter)
    logger.addHandler(ch)

    # parse cli-arguments
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-v', '--verbose',
        help='DEBUG logging mode',
        action='store_true',
    )
    args = parser.parse_args()

    # set loggin level
    if args.verbose:
        logger.setLevel(logging.DEBUG)
        logger.info('Logging level: DEBUG')
    else:
        logger.setLevel(logging.INFO)
        logger.info('Logging level: INFO')

    # scan for bulbs
    logger.debug('Scanning for lightbulbs')
    scanner = BulbScanner()
    scanner.scan()
    logger.debug(f'Found lightbulbs:')
    logger.debug(scanner.found_bulbs)

    # initialize AccessoryServer
    logger.debug('Create HomeKit-AccessoryServer...')
    driver = AccessoryDriver()
    bridge = Bridge(driver, 'MagicHome')
    logger.debug('HomeKit-AccessoryServer created successful.')

    for bulb in scanner.found_bulbs:
        # add bulbs to bridge
        logger
        bridge.add_accessory(
            FluxLED(
                driver,
                bulb['id'],
                bulb['ipaddr'],
                logger=logger,
            ),
        )

    # add bridge to the driver
    driver.add_accessory(bridge)

    try:
        # start the server
        logger.info('Start server...')
        driver.start()
    except KeyboardInterrupt:
        logger.info('Stopping server...')
        driver.stop()

if __name__ == '__main__':
    main()
