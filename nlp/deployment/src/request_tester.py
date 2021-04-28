import json
import requests

def main():
    print('putting')
    res = requests.put('http://54.144.74.130:8090', params={'query': 'how do I use java????'})
    print('put')
    print(res)
    
main()