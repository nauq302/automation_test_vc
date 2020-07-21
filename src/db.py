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



# class CampaignModel:
#     @staticmethod
#     def getAllIdAndName():
#         return CampaignModel.col.find({}, { "id": 1, "name": 1 })

# CampaignModel.col = db.tbl_campaign

#######################################################################
def getCapaignsIdAndName():
    return db.tbl_campaign.find({}, { "id": 1, "name": 1 }) 

def getCampaignNameOfDialplan(dialplan_id):
    campaignID = db.tbl_test_dialplan.find_one({ "id": dialplan_id }, { "id_campaign": 1 })["id_campaign"]
    return db.tbl_campaign.find_one({ "id": campaignID }, { "name": 1 })["name"]

#######################################################################
def getTestDialplan(id):
    return db.tbl_test_dialplan.find_one({ "id" : id })

def getTestDialplanName(id):
    return db.tbl_test_dialplan.find_one({ "id" : id }, { "name":1 })["name"]

def getTestDialplans(searchString, pageIndex, pageSize):
    search_from = (pageIndex - 1) * pageSize
    test_dialplans = db.tbl_test_dialplan.find({ "name": searchOptions(searchString) }) \
        .skip(search_from)  \
        .limit(pageSize)
    return test_dialplans

def getTestDialplansIdAndName():
    return db.tbl_test_dialplan.find({}, { "id": 1, "name": 1 }) 

def getTestDialplanIdAndName(id):
    return db.tbl_test_dialplan.find_one({ "id": id }, { "id": 1, "name": 1 }) 

#######################################################################

def getTestCaseInfoOfDialplan(id):
    return db.tbl_test_dialplan.find_one({ "id": id }, { "info_test_case": 1 }) 

def addTestCaseInfoOfDialplan(testDialplanId, testCaseInfo):
    if getTestCaseInfoOfDialplan(testDialplanId).get("info_test_case") == None:
        db.tbl_test_dialplan.find_one_and_update(
            { "id": testDialplanId },
            { 
                "$set" : {
                    "info_test_case": []
                }
            }
        )

    db.tbl_test_dialplan.find_one_and_update(
        { "id": testDialplanId },
        { 
            "$addToSet" : {
                "info_test_case": testCaseInfo
            }
            
        }
    )

def updateTestCaseInfoOfDialplan(testDialplanId, testCaseInfo):
    db.tbl_test_dialplan.find_one_and_update(
        { 
            "id": testDialplanId,
            "info_test_case.id": testCaseInfo["id"]
        },
        { 
            "$set": {
                "info_test_case.$.status": testCaseInfo["status"],
                "info_test_case.$.result": testCaseInfo["result"],
            }
            
        }
    )

def removeTestCaseInfoOfDialplan(testDialplanId, testCaseInfo):
    db.tbl_test_dialplan.find_one_and_update(
        { 
            "id": testDialplanId
        },
        { 
            "$pull": {
                "info_test_case": {
                    "id": testCaseInfo["id"]
                }
            }
            
        }
    )

    db.tbl_call_listen_result.remove({
        "id_test_dialplan": testDialplanId,
        "id_test_case": testCaseInfo["id"]
    })


#######################################################################
    



def getPassedAndTotalTestCase(id):
    td_list =  getTestCaseInfoOfDialplan(id)
    return td_list.find({ "status": "passed" }).count(True) , td_list.count(True)

def deleteTestDialplan(id):
    db.tbl_test_dialplan.remove({ "id": id })

def getTestDialplanCount(searchString):
    return db.tbl_test_dialplan.find({ "name": searchOptions(searchString) }).count(True)

def getTestCase(id):
    return db.tbl_test_case.find_one({ "id": id })

def getTestCasesOfCampaign(campaign, pageIndex, pageSize):
    filter = { "id_campaign": campaign["id"] } if campaign["id"] != "" else {}
    search_from = (pageIndex - 1) * pageSize
    test_cases = db.tbl_test_case.find(filter) \
        .skip(search_from)  \
        .limit(pageSize)
    return test_cases

def getTestCaseOfDialpan(dialplan):
    testCasesIdAndName = db.tbl_test_case.find({ "id_campaign": dialplan["id_campaign"] }, { "id": 1, "name": 1 })
    return testCasesIdAndName

def addTestCase(testCase):
    db.tbl_test_case.insert(testCase)

def updateTestCase(testCase):
    db.tbl_test_case.update_one(
        { "id": testCase["id"] },
        {
            "$set": {
                "name": testCase["name"],
                "id_campaign": testCase["id_campaign"],
                "require": testCase["require"], 
                "create_date": testCase["create_date"],
                "desc": testCase["desc"]
            }
        }
    )

def deleteTestCase(id):
    db.tbl_test_case.remove({ "id": id })
    deleteTestCaseDependInfo(id)

def getCallListenScript(id):
    return db.tbl_call_listen_script.find({ "id": id })


def getCallListenScriptsOfTestCase(test_case_id):
    return db.tbl_call_listen_script.find({ "id_test_case": test_case_id })



def getCallListenScriptIdsOfTestCase(test_case_id):
    return db.tbl_call_listen_script.find({ "id_test_case": test_case_id }, { "id": 1 })

def deleteCallListenScript(id):
    db.tbl_call_listen_script.remove({ "id": id })

def deleteActionOfCallListen(callListenScriptID):
    db.tbl_action_dialplan.remove({ "id_call_listen": callListenScriptID })

def deleteCallListenResult(callListenScriptID):
    db.tbl_call_listen_result.remove({ "id_call_listen": callListenScriptID })

def getCallListenResult(call_listen_id, test_dialplan_id):
    return db.tbl_call_listen_result.find_one({ "id_call_listen": call_listen_id, "id_test_dialplan": test_dialplan_id })

def updateCallListenScript(callListenScript):
    db.tbl_call_listen_script.update({
        "id": callListenScript["id"]
    },
    {
        "$set": {
            "id_test_case": callListenScript["id_test_case"],
            "type": callListenScript["type"],
            "machine": callListenScript["machine"],
            "default_state": callListenScript["default_state"],
            "default_callee": callListenScript["default_callee"]
        }
    })


def initCallListenResult(test_case_id, test_dialplan_id):
    callListenScripts = db.tbl_call_listen_script.find({ 
            "id_test_case": test_case_id 
        }, {
            "id": 1, 
            "default_callee": 1, 
            "default_state": 1
    })

    for cl in callListenScripts:
        db.tbl_call_listen_result.update({
            "id_test_dialplan": test_dialplan_id,
            "id_test_case": test_case_id,
            
        }, {
            "$set": {
                "id_call_listen": cl["id"],
                "expected_callee": cl["default_callee"],
                "expected_state": cl["default_state"]
            }
        },
            True
        )


def addCallListenScript(call_listen_script):
    db.tbl_call_listen_script.insert(call_listen_script)


def getActionsOfCallListenScript(call_listen_script_id):
    return db.tbl_action_dialplan.find({ "id_call_listen": call_listen_script_id })

def addActionDialplans(action_dialplans):
    db.tbl_action_dialplan.insert_many(action_dialplans)

def deleteTestCaseDepend(id):
    call_listen_script_id_list = db.tbl_call_listen_script.find({ "id_test_case": id }, { "id": 1 })
    for cldi in call_listen_script_id_list:
        db.tbl_action_dialplan.delete_many({ "id_call_listen": cldi["id"] })

    db.tbl_call_listen_script.delete_many({ "id_test_case": id })

def deleteTestCaseDependInfo(id):
    db.tbl_test_dialplan.update_many(
        {},
        { 
            "$pull": {
                "info_test_case": {
                    "id": id
                }
            } 
        }
    )

    db.tbl_call_listen_result.remove({
        "id_test_case": id
    })

def updateCallListenResult(callListenResults):
    for clr in callListenResults:
        db.tbl_call_listen_result.update({
            "id_test_dialplan": clr["id_test_dialplan"],
            "id_call_listen": clr["id_call_listen"],
        },
        {
            "$set": {
                "status": clr["status"],
                "expected_state": clr["expected_state"],
                "real_state": clr["real_state"],
                "expected_callee": clr["expected_callee"],
                "real_callee": clr["real_callee"],
            }
        },
            True
        )

def getCallListenIds():
    db.tbl_call_listen_script.find({}, { "id": 1 })

def getCallListenIdsOfTestCase(test_case_id):
    return db.tbl_call_listen_script.find({ "id_test_case": test_case_id }, { "id": 1 })

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
