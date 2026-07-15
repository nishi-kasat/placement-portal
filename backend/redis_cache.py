import redis
import json

redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True, socket_connect_timeout=1)

def set_cache(key, data, expiry=60):
    try:
        redis_client.setex(key, expiry, json.dumps(data))
    except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError):
        pass

def get_cache(key):
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError):
        pass
    return None

def delete_cache(key):
    try:
        redis_client.delete(key)
    except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError):
        pass

def clear_student_dashboards():
    try:
        if hasattr(redis_client, "db"):
            keys_to_del = [k for k in redis_client.db.keys() if k.startswith("student_dashboard_")]
            for k in keys_to_del:
                del redis_client.db[k]
        else:
            for key in redis_client.scan_iter("student_dashboard_*"):
                redis_client.delete(key)
    except Exception:
        pass