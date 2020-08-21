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
client = pymongo.MongoClient(config.MONGODB_SERVERS)
DB = client.admin.authenticate(config.MONGODB_USER,config.MONGODB_PASSWORD, None)
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

    user_info = db.tbl_account_automation.find_one({"$or":[ {"username": username},
                                                           {"email": username} ]})

    if user_info and password == user_info['password']:
        session_id = str(uuid.uuid4())
        db.tbl_account_automation.update({'username': user_info['username']},
                             {'$set': {'session_id': session_id}})

        return session_id, 'Bạn đã đăng nhập thành công.'
    else:
        return False, 'Username  hoặc mật khẩu của bạn không đúng.'


def searchOptions(searchString):
    return { "$regex": "^.*" + searchString + ".*$", "$options": "i" }

#######################################################################################################

class CampaignDAO:
    col = db.tbl_campaign

    @staticmethod
    def getAllIdAndName():
        return CampaignDAO.col.find({}, { "id": 1, "name": 1 })

    @staticmethod
    def getName(id):
        return CampaignDAO.col.find_one({ "id": id }, { "name": 1 })["name"]

##############################################################################################################

class TestDialplanDAO:
    col = db.tbl_test_dialplan

    @staticmethod
    def get(id):
        return TestDialplanDAO.col.find_one({ "id" : id })

    @staticmethod
    def getCampaignName(id):
        campaignID = TestDialplanDAO.col.find_one({ "id": id }, { "id_campaign": 1 }).get("id_campaign")

        if campaignID:
            return CampaignDAO.col.find_one({ "id": campaignID }, { "name": 1 })["name"]
        else:
            return ""

    @staticmethod
    def getHotlineNumber(id):
        return TestDialplanDAO.col.find_one({ "id": id }, { "hotline_number": 1 })["hotline_number"]

    @staticmethod
    def getAllHotlineOfCampaign(campaignId):
        return TestDialplanDAO.col.distinct("hotline_number", { "id_campaign": campaignId })

    @staticmethod
    def getName(id):
        return TestDialplanDAO.col.find_one({ "id": id }, { "name": 1 })["name"]

    @staticmethod
    def search(searchString, pageIndex, pageSize):
        search_from = (pageIndex - 1) * pageSize

        cids = CampaignDAO.col.distinct("id", { "name": searchOptions(searchString) })

        testDialplans = TestDialplanDAO.col.find({ 
            "$or": [
                {
                    "name": searchOptions(searchString)
                }, { 
                    "id_campaign": {
                        "$in": cids
                    } 
                }
            ]
        })

        return testDialplans.count(True), testDialplans.sort([("create_date", -1)]).skip(search_from).limit(pageSize)

    @staticmethod
    def getAllIdAndName():
        return TestDialplanDAO.col.find({}, { "id": 1, "name": 1 }) 

    @staticmethod
    def getIdAndName(id):
        return TestDialplanDAO.col.find_one({ "id": id }, { "id": 1, "name": 1 }) 

    @staticmethod
    def getTestCaseInfo(id):
        return TestDialplanDAO.col.find_one({ "id": id }, { "info_test_case": 1 }).get("info_test_case")

    @staticmethod
    def remove(id):
        TestDialplanDAO.col.remove({ "id": id })

    @staticmethod
    def getPassedAndTotalTestCase(id):
        td_list =  TestDialplanDAO.getTestCaseInfo(id)
        return td_list.find({ "status": "passed" }).count(True) , td_list.count(True)

    @staticmethod
    def updateTestCaseInfo(id, testCaseInfo):
        TestDialplanDAO.col.find_one_and_update(
            { 
                "id": id,
                "info_test_case.id": testCaseInfo["id"]
            }, { 
                "$set": {
                    "info_test_case.$.priority": testCaseInfo["priority"],
                    "info_test_case.$.status": testCaseInfo["status"],
                    "info_test_case.$.result": testCaseInfo["result"],
                }   
            }
        )
        
        print(id, testCaseInfo["id"])

    @staticmethod
    def removeTestCaseInfo(id, testCaseInfo):
        TestDialplanDAO.col.find_one_and_update(
            { 
                "id": id
            }, { 
                "$pull": {
                    "info_test_case": {
                        "id": testCaseInfo["id"]
                    }
                } 
            }
        )

        CallListenResultDAO.col.remove({
            "id_test_dialplan": id,
            "id_test_case": testCaseInfo["id"]
        })

    @staticmethod
    def removeTestCaseDependInfo(testCaseId):
        TestDialplanDAO.col.update_many(
            {},
            { 
                "$pull": {
                    "info_test_case": {
                        "id": testCaseId
                    }
                } 
            }
        )

        TestDialplanDAO.col.update_many(
            {},
            { 
                "$pull": {
                    "info_test_case": {
                        "id": testCaseId
                    }
                } 
            }
        )

        CallListenResultDAO.col.remove({
            "id_test_case": testCaseId
        })


    @staticmethod
    def addTestCaseInfo(id, testCaseInfo):
        if TestDialplanDAO.getTestCaseInfo(id) == None:
            TestDialplanDAO.col.find_one_and_update(
                { "id": id },
                { 
                    "$set" : {
                        "info_test_case": []
                    }
                }
            )

        TestDialplanDAO.col.find_one_and_update(
            { "id": id },
            { 
                "$addToSet" : {
                    "info_test_case": testCaseInfo
                }
                
            }
        )
    
    @staticmethod
    def setState(id, state):
        TestDialplanDAO.col.update_one({ "id": id }, { "$set": { "state": state } })

#######################################################################

class HotlineDAO:
    col = db.tbl_hotline

    @staticmethod
    def getServerIP(hotlineNumber):
        return HotlineDAO.col.find_one({ "hotline_number": hotlineNumber }, { "stagging_ip": 1 }).get("stagging_ip")

#######################################################################

class TestCaseDAO:
    col = db.tbl_test_case

    @staticmethod
    def get(id):
        return TestCaseDAO.col.find_one({ "id": id })

    @staticmethod
    def getCampaignName(id):
        campaignID = TestCaseDAO.col.find_one({ "id": id }, { "id_campaign": 1 }).get("id_campaign")

        if campaignID:
            return CampaignDAO.col.find_one({ "id": campaignID }, { "name": 1 })["name"]
        else:
            return ""

    @staticmethod
    def getOfTestDialplan(dialplan):
        return TestCaseDAO.col.find({ "id_campaign": dialplan["id_campaign"] }, { "id": 1, "name": 1, "priority": 1 })

    @staticmethod
    def add(testCase):
        TestCaseDAO.col.insert(testCase)

    @staticmethod
    def getOfCampaign(campaignId, pageIndex, pageSize):
        filter = { "id_campaign": campaignId } if campaignId != "" else {}
        search_from = (pageIndex - 1) * pageSize
        test_cases = db.tbl_test_case.find(filter) \
            .skip(search_from)  \
            .limit(pageSize)
        return test_cases

    @staticmethod
    def update(testCase):
        TestCaseDAO.col.update_one(
            { "id": testCase["id"] },
            {
                "$set": {
                    "name": testCase["name"],
                    "id_campaign": testCase["id_campaign"],
                    "require": testCase["require"], 
                    "create_date": testCase["create_date"],
                    "desc": testCase["desc"],
                    "priority": testCase["priority"]
                }
            }
        )

    @staticmethod
    def remove(id):
        TestCaseDAO.col.remove({ "id": id })

#######################################################################

class CallListenScriptDAO:
    col = db.tbl_call_listen_script

    @staticmethod
    def getOfTestCase(testCaseId):
        return CallListenScriptDAO.col.find({ "id_test_case": testCaseId })

    @staticmethod
    def getIdsOfTestCase(testCaseId):
        return CallListenScriptDAO.col.find({ "id_test_case": testCaseId }, { "id": 1 })

    @staticmethod
    def add(callListenScript):
        CallListenScriptDAO.col.insert(callListenScript)

    @staticmethod
    def remove(id):
        CallListenScriptDAO.col.remove({ "id": id })

    @staticmethod
    def update(callListenScript):
        db.tbl_call_listen_script.update({ "id": callListenScript["id"] }, { "$set": callListenScript })

#######################################################################

class ActionDAO:
    col = db.tbl_call_listen_action

    @staticmethod
    def getOfCallListenScript(callListenScriptId):
        return ActionDAO.col.find({ "id_call_listen": callListenScriptId })

    @staticmethod
    def add(action):
        ActionDAO.col.insert(action)

    @staticmethod
    def addMany(actions):
        ActionDAO.col.insert_many(actions)

    @staticmethod
    def removeOfCallListenScript(callListenScriptId):
        ActionDAO.col.remove({ "id_call_listen": callListenScriptId })

#######################################################################

class ExtentionDAO:
    col = db.tbl_extension

    @staticmethod
    def getAllIdAndNumber():
        return ExtentionDAO.col.find({}, { "id": 1, "extension_number": 1 })

    @staticmethod
    def getIdAndNumberOfHotline(hotline):
        return ExtentionDAO.col.find({}, { "id": 1, "extension_number": 1 })


    @staticmethod
    def getByNumber(number):
        return ExtentionDAO.col.find_one({ "extension_number": number })

    @staticmethod
    def getAllNumberOfCampaign(campaignID):
        campaignName = CampaignDAO.getName(campaignID)

        hotlineIds = HotlineDAO.col.distinct("id", { "exchange": campaignName })

        extensionIds = db.tbl_map_all.distinct(
            "extension_id", { 
                "hotline_id": {
                    "$in": hotlineIds
                } 
            }
        )

        return ExtentionDAO.col.distinct(
            "extension_number", {
                "id": {
                    "$in": extensionIds
                }
            }
        )

#######################################################################

class CallListenResultDAO:
    col = db.tbl_call_listen_result

    @staticmethod
    def get(callListenScriptID, testDialplanId):
        return CallListenResultDAO.col.find_one({ 
            "id_call_listen": callListenScriptID, 
            "id_test_dialplan": testDialplanId 
        })

    @staticmethod
    def removeOfCallListenScript(callListenScriptID):
        CallListenResultDAO.col.remove({ "id_call_listen": callListenScriptID })
    
    @staticmethod
    def updateMany(callListenResults):
        for clr in callListenResults:
            CallListenResultDAO.col.update(
                {
                    "id_test_dialplan": clr["id_test_dialplan"],
                    "id_call_listen": clr["id_call_listen"],
                    "id_test_case": clr["id_test_case"],
                }, {
                    "$set": {
                        "status": clr["status"],
                        "expected_state": clr["expected_state"],
                        "real_state": clr["real_state"],
                        "expected_callee": clr["expected_callee"],
                        "real_callee": clr["real_callee"],
                    }
                }, upsert=True
            )

#######################################################################

#######################################################################


#######################################################################




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
