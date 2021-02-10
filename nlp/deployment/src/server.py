#!/usr/bin/env python
"""
server

web server for application
"""

from yaml import dump as yaml_dump
from logging import Logger
from typing import cast
from loguru import logger
from aiohttp import web
from bert.predict.main import main as predict_bert
from shared.type import NLPType, LanguageType, PackageManager
from shared.utils import get_file_path_relative
from aiohttp_swagger3 import SwaggerDocs, SwaggerUiSettings
from aiohttp_swagger3.routes import _SWAGGER_SPECIFICATION as swaggerspec_key, CustomEncoder
from json import dumps as json_dump, loads as json_load


async def index() -> web.Response:
    """
    index page resolver
    ---
    description: Index page request resolver.
    tags:
    - Health check
    responses:
      '200':
        description: successful operation. Return index message.
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Message"
    """
    return web.json_response({
        'message': 'work in progress nlp'
    })


async def hello() -> web.Response:
    """
    ---
    description: Hello World request resolver.
    tags:
    - Hello
    - Health check
    responses:
      '200':
        description: successful operation. Return hello message.
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Message"
    """
    return web.json_response({
        'message': 'Hello World!'
    })


async def ping() -> web.Response:
    """
    ---
    description: Ping request resolver.
    tags:
    - Health check
    responses:
      '200':
        description: successful operation. Return empty text
        content:
          text/plain:
            schema:
              type: string
    """
    return web.Response(text='')


QUERY_KEY: str = 'query'
LANG_KEY: str = 'language'
NUM_RES_KEY: str = 'limit'


async def predict_library_elastic_request(term: str, lang: LanguageType, package_manager: PackageManager):
    if not LanuageType.has_value(lang):
        raise TypeError(
            f"lang has value: {lang} expected {LanguageType.get_values()}")
    if not PackageManager.has_value(package_manager):
        raise TypeError(
            f"lang has value: {package_manager} expected {PackageManager.get_values()}")

    from config import ELASTICSEARCH_HOST
    query = json.dumps({
        "query": {
            "match": {
                "library": term,
                "language": lang.nam,
                "package_manager": package_manager
            }
        }
    })

    resp = requests.get(ELASTICSEARCH_HOST, data=query)
    res = json.loads(resp.text)

    return res


async def predict_library(request: web.Request) -> web.Response:
    """
    predict a library given the query input
    ---
    description: Library prediction resolver
    tags:
    - NLP
    responses:
      '200':
        description: successful operation. Return library predictions.
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Prediction"
    """
    from config import ELASTICSEARCH_HOST
    json_data = await request.json()
    if QUERY_KEY not in json_data:
        raise ValueError(f'cannot find key {QUERY_KEY} in request body')
    # res = predict_bert(json_data[QUERY_KEY], NLPType.base_library)
    res = predict_library_elastic_request(
        ELASTICSEARCH_HOST, json_data[QUERY_KEY], json_data[LANG_KEY])

    return web.json_response({
        'data': res
    })


async def predict_language(request: web.Request) -> web.Response:
    """
    predict the language given the query input
    ---
    description: Language prediction resolver
    tags:
    - NLP
    responses:
      '200':
        description: successful operation. Return language predictions.
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Prediction"
    """
    json_data = await request.json()
    if QUERY_KEY not in json_data:
        raise ValueError(f'cannot find key {QUERY_KEY} in request body')
    res = predict(json_data[QUERY_KEY], NLPType.language)
    if NUM_RES_KEY in json_data:
        res = res[:json_data[NUM_RES_KEY]]
    return web.json_response({
        'data': res
    })


async def predict_related_library(request: web.Request) -> web.Response:
    """
    predict the n-nearest libraries given the query library
    ---
    description: Inter-library prediction resolver
    tags:
    - Graph
    - NLP
    responses:
      '200':
        description: successful operation. Return inter-library predictions.
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Prediction"
    """
    json_data = await request.json()
    required_keys = [QUERY_KEY, NUM_RES_KEY]
    for req_key in required_keys:
        if req_key not in json_data:
            raise ValueError(f"cannot find key {req_key} in request body")
    # TODO: Write this method \/
    res = predict(json_data[QUERY_KEY], {
                  "n_nearest": int(json_data[NUM_RES_KEY])})
    return web.json_response({
        'data': res
    })


def start_server():
    """
    run web server
    """
    from config import PORT, VERSION

    app = web.Application()

    current_folder: str = 'deployment'
    components_file = get_file_path_relative(
        f'{current_folder}/src/swagger/components.yml')
    swagger = SwaggerDocs(
        app,
        swagger_ui_settings=SwaggerUiSettings(path="/swagger"),
        components=components_file,
        title="NLP",
        version=VERSION
    )
    swagger.add_routes([
        web.get('/', index),
        web.get('/hello', hello),
        web.get('/ping', ping),
        web.put('/predictLibrary', predict_library),
        web.put('/predictLanguage', predict_language)
    ])
    swagger_spec_dict = json_load(
        json_dump(app[swaggerspec_key], cls=CustomEncoder))
    swagger_spec_file_path = get_file_path_relative(
        f'{current_folder}/swagger.yml')
    with open(swagger_spec_file_path, 'w') as swagger_spec_file:
        yaml_dump(swagger_spec_dict, swagger_spec_file)

    logger.info(f'Nlp started: http://localhost:{PORT} 🚀')
    web_logger = cast(Logger, logger)
    web.run_app(app, port=PORT, access_log=web_logger)
