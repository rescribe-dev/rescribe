import yaml
import json
import requests
import tensorflow as tf

from typing import cast
from aiohttp import web
from loguru import logger
from logging import Logger
from utils.types import reScribeModel
from utils.utils import get_file_path_relative
from aiohttp_swagger3 import SwaggerDocs, SwaggerUiSettings
from utils.types import NLPType, LanguageType, PackageManager

from aiohttp_swagger3.routes import _SWAGGER_SPECIFICATION as swaggerspec_key, CustomEncoder

QUERY_KEY: str = 'query'
LANG_KEY: str = 'language'
NUM_RES_KEY: str = 'limit'

tokenizer: reScribeModel = None
language_prediction_model: reScribeModel = None
rlp_model: reScribeModel = None

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

    res = language_prediction_model(tokenizer.tokenize([json_data[QUERY_KEY]]))
    return web.json_response({
        'data': str(tf.get_static_value(res))
    })
  
async def predict_library_elastic_request(request: web.Request): #, lang: LanguageType, package_manager: PackageManager):
    lang = LanguageType.java.value
    package_manager = PackageManager.maven.value
    if not LanguageType.has_value(lang):
        raise TypeError(
            f"lang has value: {lang} expected {LanguageType.get_values()}")
    if not PackageManager.has_value(package_manager):
        raise TypeError(
            f"lang has value: {package_manager} expected {PackageManager.get_values()}")
  
    json_data = await request.json()
    if QUERY_KEY not in json_data:
        raise ValueError(f'cannot find key {QUERY_KEY} in request body')      
        
    from src.config import ELASTICSEARCH_HOST
    query = json.dumps({
        # "query": {
        #     "match": {
        #         "library": json_data[QUERY_KEY],
        #         "language": lang,
        #         "package_manager": package_manager
        #     }
        # }
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "library": str(json_data[QUERY_KEY]),
                        },
                    },
                    {
                        "match": {
                            "language": lang,
                        },
                    },
                    {
                        "match": {
                            "package_manager": package_manager
                        }
                    },
                ]
            }
        }
    })

    headers={
        'Content-Type': 'application/json'
    }
    print(query)
    resp = requests.get(f'{ELASTICSEARCH_HOST}/library/_search', data=query, headers=headers)
    res = json.loads(resp.text)
    return web.json_response({
        'data': res
    })

async def predict_related_library(request: web.Request): #, lang: LanguageType
    lang = LanguageType.java.name
    if not LanguageType.has_value(lang):
        raise TypeError(
            f"lang has value: {lang} expected {LanguageType.get_values()}")
    json_data = await request.json()
    if QUERY_KEY not in json_data: 
        raise ValueError(f"cannot find key {QUERY_KEY} in request body")
    query = json_data[QUERY_KEY]
    lim = 10
    if NUM_RES_KEY in json_data:
        lim = int(json_data[NUM_RES_KEY])
        
    try:
        res = rlp_model(query, lim)#language_prediction_model(tokenizer.tokenize([json_data[QUERY_KEY]]))
    except Exception as err:
        return web.json_response({
            'data': [],
            'error': True,
            'error_msg': str(err)
        })
    return web.json_response({
        'data': res
    })
    
def start_server():
    """
    run web server
    """
    from src.config import PORT, VERSION
    from src.initialize_models import language_prediction_model as lpm, tokenizer as tok, rlp_model as rlp
    
    global tokenizer
    global language_prediction_model
    global rlp_model
    tokenizer = tok
    language_prediction_model = lpm
    rlp_model = rlp
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
        web.put('/predictRelatedLibrary', predict_related_library),
        web.put('/predictLibrary', predict_library_elastic_request),
        web.put('/predictLanguage', predict_language)
    ])
    swagger_spec_dict = json.loads(
        json.dumps(app[swaggerspec_key], cls=CustomEncoder))
    swagger_spec_file_path = get_file_path_relative(
        f'{current_folder}/swagger.yml')
    with open(swagger_spec_file_path, 'w') as swagger_spec_file:
        yaml.dump(swagger_spec_dict, swagger_spec_file)

    logger.info(f'Nlp started: http://localhost:{PORT} 🚀')
    web_logger = cast(Logger, logger)
    web.run_app(app, host='0.0.0.0', port=PORT, access_log=web_logger)