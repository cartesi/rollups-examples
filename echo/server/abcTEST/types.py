from typing import List, TypedDict

class Headers(TypedDict):
    host: List[str]
    connection: List[str]
    cache_control: List[str]
    cookie:  List[str]

class Action(TypedDict):
    path: str
    method: str
    payload: dict
    headers: Headers
