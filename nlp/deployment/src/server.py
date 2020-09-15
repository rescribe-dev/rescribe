#!/usr/bin/env python3
"""
server

web server for application
"""

from logging import Logger
from typing import cast
from loguru import logger
from aiohttp import web
from bert.predict.main import main as predict_bert
from shared.type import NLPType


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


QUERY_KEY: str = 'query'

# TODO - get correct output, create version for language


async def predict_library(request: web.Request) -> web.Response:
    """
    process nlp input
    """
    json_data = await request.json()
    if QUERY_KEY not in json_data:
        raise ValueError(f'cannot find key {QUERY_KEY} in request body')
    predict_bert(json_data[QUERY_KEY], NLPType.language)
    return web.json_response({
        'matches': 'results...'
    })


def start_server():
    """
    run web server
    """
    from config import PORT

    app = web.Application()
    app.add_routes([
        web.get('/', index),
        web.get('/hello', hello),
        web.get('/ping', ping),
        web.put('/predictLibrary', predict_library)
    ])
    logger.info(f'Nlp started: http://localhost:{PORT} 🚀')
    web_logger = cast(Logger, logger)
    web.run_app(app, port=PORT, access_log=web_logger)
