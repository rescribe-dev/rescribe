# redis

- follow [this setup](https://aws.amazon.com/getting-started/hands-on/setting-up-a-redis-cluster-with-amazon-elasticache/)
- Make sure to double check settings, many of them cannot be changed after initialization
- If there is no configuration endpoint available the system will not work, you will probably have to redo it. configuration endpoint is the host.
- needs to be in cluster mode, with password and inbound ports set in security groups.
