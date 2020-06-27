#!/usr/bin/env python3
"""
server

web server for application
"""

from logging import Logger
from typing import cast
from loguru import logger
from aiohttp import web


async def index(_request: web.Request):
    """
    index page resolver
    """
    return web.json_response({
        'message': 'work in progress nlp'
    })


async def hello(_request: web.Request):
    """
    hello world request resolver
    """
    return web.json_response({
        'message': 'Hello World!'
    })


async def ping(_request: web.Request):
    """
    hello world request resolver
    """
    return web.Response(text='')


def start_server(port: int):
    """
    run web server
    """
    app = web.Application()
    app.add_routes([
        web.get('/', index),
        web.get('/hello', hello),
        web.get('/ping', ping),
    ])
    logger.info(f'Nlp started: http://localhost:{port} 🚀')
    web_logger = cast(Logger, logger)
    web.run_app(app, host='localhost', port=port, access_log=web_logger)
