#!/usr/bin/env python3
"""
run sagemaker

creates custom job in sagemaker
"""
from os import getenv
from dotenv import load_dotenv
from typing import Union
from sagemaker.estimator import Estimator

default_instance_type: str = 'ml.m4.xlarge'


def main(role: Union[str, None] = None, image_name: Union[str, None] = None):
    """
    main sagemaker function
    """
    load_dotenv()
    if image_name is None:
        image_name = getenv('IMAGE_NAME')
        if image_name is None:
            raise ValueError('cannot find image name in environment')
    if role is None:
        role = getenv('ROLE')
        if role is None:
            raise ValueError('cannot find role in environment')
    instance_type: Union[str, None] = getenv('INSTANCE_TYPE')
    if instance_type is None:
        instance_type = default_instance_type
    estimator = Estimator(image_name=image_name,
                          role=role,
                          train_instance_count=1,
                          train_volume_size=5,
                          train_instance_type=instance_type)

    estimator.fit(wait=False)


if __name__ == '__main__':
    main()
