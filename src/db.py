# -*- coding: utf-8 -*-
import config
import pymongo
from time import time
import datetime
from datetime import time
import time
import uuid
from bson import ObjectId
# connect db
client = pymongo.MongoClient(config.DB_MONGO)
db = client.voice_db


def convert_time_to_int(time_convert):
    time_format = "%d/%m/%Y %H:%M"
    current_result = int(time.mktime(datetime.datetime.strptime(time_convert, time_format).timetuple()))
    return current_result


def convert_int_to_time(time_convert):
    time_format = "%d/%m/%Y %H:%M"
    current_result = datetime.datetime.fromtimestamp(int(time_convert)).strftime(time_format)
    return current_result



def get_current_datetime(option):
    current_result = int(time.mktime(datetime.datetime.now().timetuple()))
    if option == "date":
        time_format = "%d-%m-%Y"
        current_result = datetime.datetime.fromtimestamp(int(current_result)).strftime(time_format)
        current_result = int (time.mktime(datetime.datetime.strptime(current_result,time_format).timetuple()))
    return current_result


def convert_date_to_int(date_convert):
    time_format = "%d-%m-%Y"
    current_result = int (time.mktime(datetime.datetime.strptime(date_convert, time_format).timetuple()))
    return current_result

def convert_int_to_date(date_convert):
    time_format = "%d-%m-%Y"
    current_result = datetime.datetime.fromtimestamp(int(date_convert)).strftime(time_format)
    return current_result

# check collection

def check_collection_exist(collection):
    if collection in db.list_collection_names():
        return True
    else:
        return False

def sign_out(user_id):
    db.tbl_account_automation.update({"_id": user_id},
                         {"$unset": {"session_id": True}})
    return True

def login(username, password):
    if not username or not password:
        return False, 'Vui lòng nhập Username & password.'
    username = username.lower().strip()

    user_info = db.tbl_account_automation.find_one({"$or":
                                                          [ {"username": username},
                                                           {"email": username},
                                                           {"phone_number": username} ]})

    if user_info and password == user_info['password']:
        session_id = str(uuid.uuid4())
        db.tbl_account_automation.update({'username': user_info['username']},
                             {'$set': {'session_id': session_id}})

        return session_id, 'Bạn đã đăng nhập thành công.'
    else:
        return False, 'Username  hoặc mật khẩu của bạn không đúng.'




# find all documents


# def find_all(collection, dict=None):
#     if check_collection_exist(collection):
#         return db[collection].find(dict)
#     else:
#         return None

def count_record(collection, dict):
    res = db[collection].find(dict).count()
    return res

def get_user_id(session_id):
    user = db.tbl_account_automation.find_one({'session_id': session_id}, {'_id': True})
    return user['_id'] if user else None

def get_user_info(user_id):
    if not isinstance(user_id, ObjectId):
        user_id = ObjectId(user_id)
    res = db.tbl_account_automation.find_one({'_id': user_id})
    return res


def find_all(collection, dict,
             order=None,
             distinct=None,
             page=None,
             limit=None,
             incre=-1, disable_field = None):
    if page:
        if not limit:
            limit = 20
        page = int(page)
        limit = int(limit)
        if order:
            res = db[collection].find(dict, disable_field)\
                .sort(order, incre)\
                .skip((page - 1) * limit)\
                .limit(limit)
        else:
            res = db[collection].find(dict, disable_field)\
                .skip((page - 1) * limit)\
                .limit(limit)
    else:
        if order:
            res = db[collection].find(dict, disable_field).sort(order, incre)
        else:
            res = db[collection].find(dict, disable_field)
    if distinct:
        res = res.distinct(distinct)
        res = filter(lambda r: r != "", res)
    return res


# find one document


def find_one(collection, dict=None, field_not = None):
    if check_collection_exist(collection):
        return db[collection].find_one(dict, field_not)
    else:
        return None

# save document into database


def add_document(collection, dict, field_unique=None):
    if field_unique:
        db[collection].create_index(
            field_unique, unique=True, sparse=True)
    try:
        db[collection].insert(dict)
        message = {"status": True, "message": "Insert success"}
        if "id" in dict:
            message.update({"id": dict["id"]})
    except BaseException:
        message = {
            "status": False,
            "message": "{} is exists.".format(field_unique)}
    return message

# update document


def update_document(collection, query_dict, dict):
    return db[collection].update(query_dict, {"$set": dict})


# delete document


def delete_document(collection, dict):
    return db[collection].delete_one(dict)

# def get_document(table, query,
#                  order=None,
#                  distinct=None,
#                  page=None,
#                  limit=None,
#                  incre=-1):
#     if page:
#         if not limit:
#             limit = 20
#         page = int(page)
#         limit = int(limit)
#         if order:
#             res = DATABASE[table].find(query)\
#                                  .sort(order, incre)\
#                                  .skip((page-1)*limit)\
#                                  .limit(limit)
#         else:
#             res = DATABASE[table].find(query)\
#                                  .skip((page-1)*limit)\
#                                  .limit(limit)
#     else:
#         if order:
#             res = DATABASE[table].find(query).sort(order, incre)
#         else:
#             res = DATABASE[table].find(query)
#     if distinct:
#         res = res.distinct(distinct)
#         res = filter(lambda r: r != "", res)
#     if res:
#         message = {"data": list(res)}
#     else:
#         message = {"data": []}
#     return message
