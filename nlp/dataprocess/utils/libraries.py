#!/usr/bin/env python
"""
nlp type
"""

from enum import Enum
from typing import Dict, List
from utils.utils import enum_to_dict


class Libraries(Enum):
    """
    Enum to contain all of the libraries we want
    """
    # Java libraries

    javafx = ["javafx"]
    javafx8 = ["javafx-8"]
    javafx2 = ["javafx-2"]
    java_native_interface = ["java-native-interface"]
    java_stream = ["java-stream"]
    rx_java = ["rx-java"]
    rx_java2 = ["rx-java2"]
    java_me = ["java-me"]
    java_util_scanner = ["java.util.scanner"]
    javamail = ["javamail"]
    javabeans = ["javabeans"]
    javadoc = ["javadoc"]
    javac = ["javac"]
    java_web_start = ["java-web-start"]
    java_io = ["java-io"]
    java_util_concurrent = ["java.util.concurrent"]
    java_time = ["java-time"]
    java_2d = ["java-2d"]
    javax_imageio = ["javax.imageio"]
    monogdb_java = ["mongodb-java"]
    javacv = ["javacv"]
    javacard = ["javacard"]
    javasound = ["javasound"]
    lucene = ["lucene"]
    lucene_net = ["lucene.net"]
    zend_search_lucene = ["zend-search-lucene"]
    maven = ["maven"]
    maven2 = ["maven-2"]
    maven3 = ["maven-3"]

    # Python libraries

    # numpy = ["numpy"]
    # pandas = ["pandas"]
    # tensorflow = ["tensorflow"]
    # matplotlib = ["matplotlib"]
    # seaborn = ["seaborn"]
    # stats = ["stats"]
    # sys = ["sys"]
    # os = ["os"]
    # sklearn = ["sklearn"]
    # scikit_learn = ["scikit-learn"]


libraries: Dict[str, List[str]] = enum_to_dict(Libraries)
