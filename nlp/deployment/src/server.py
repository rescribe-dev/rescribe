#!/usr/bin/env python3
"""
server

web server for application
"""

from logging import Logger
from typing import cast
from loguru import logger
from aiohttp import web
from get_prediction import main as get_prediction


async def index(_request: web.Request) -> web.Response:
    """
    index page resolver
    """
    return web.json_response({
        'message': 'work in progress nlp'
    })


async def hello(_request: web.Request) -> web.Response:
    """
    hello world request resolver
    """
    return web.json_response({
        'message': 'Hello World!'
    })


async def ping(_request: web.Request) -> web.Response:
    """
    hello world request resolver
    """
    return web.Response(text='')

QUERY_KEY = 'query'


async def process_input(request: web.Request) -> web.Response:
    """
    process nlp input
    """
    json_data = await request.json()
    if QUERY_KEY not in json_data:
        raise ValueError(f'cannot find key {QUERY_KEY} in request body')
    results = get_prediction(json_data[QUERY_KEY])
    return web.json_response({
        'matches': results
    })


def start_server(port: int):
    """
    run web server
    """
    app = web.Application()
    app.add_routes([
        web.get('/', index),
        web.get('/hello', hello),
        web.get('/ping', ping),
        web.put('/processInput', process_input)
    ])
    logger.info(f'Nlp started: http://localhost:{port} 🚀')
    web_logger = cast(Logger, logger)
    web.run_app(app, port=port, access_log=web_logger)
