# -*- coding: utf-8 -*-
import os
import datetime
from json import dumps
import time
import ast
import json
import math
from uuid import uuid4, UUID
import random
from flask import (Flask, request, send_from_directory, Response,
                   render_template, redirect, session, g, make_response)
from werkzeug.datastructures import CallbackDict
from flask.sessions import SessionInterface, SessionMixin
from itsdangerous import URLSafeTimedSerializer, BadSignature
import db
import requests
import string
import simplejson
from simplejson import dumps as json
from string import whitespace as ws
import sys
import config
import api
from math import ceil
from raven.contrib.flask import Sentry
import redis
from functools import wraps
import redis
from hashlib import md5
from simplejson import load as loads_json
from simplejson import dumps as dump_json
from raven.contrib.flask import Sentry
from json import loads as load_jsons
reload(sys)

sys.setdefaultencoding("utf-8")
from cPickle import loads, dumps
async_mode = None
#Define App
app = Flask(__name__)
app.jinja_env.autoescape = False


app.config["SECRET_KEY"] = config.SECRET_KEY
app.config["SESSION_COOKIE_DOMAIN"] = config.SESSION_COOKIE_DOMAIN
sentry = Sentry(app)
#app.jinja_env.add_extension("jinja2.ext.do")

red = redis.Redis(config.DB_REDIS, 6379, db=14)


def _decode_list(data):
    rv = []
    for item in data:
        if isinstance(item, unicode):
            item = item.encode("utf-8")
        elif isinstance(item, list):
            item = _decode_list(item)
        elif isinstance(item, dict):
            item = _decode_dict(item)
        rv.append(item)
    return rv


def _decode_dict(data):
    rv = {}
    for key, value in data.iteritems():
        if isinstance(key, unicode):
            key = key.encode("utf-8")
        if isinstance(value, unicode):
            value = value.encode("utf-8")
        elif isinstance(value, list):
            value = _decode_list(value)
        elif isinstance(value, dict):
            value = _decode_dict(value)
        rv[key] = value
    return rv


# @app.context_processor
# def utility_processor():
#     def get_current_date():
#         return db.get_current_datetime("time")
#     return dict(get_current_date=get_current_date)



# @app.context_processor
# def utility_processor():
#     def format_date(datetime):
#         return db.convert_int_to_time(datetime)
#     return dict(format_date=format_date)


# @app.context_processor
# def utility_processor():
#     def format_date_main(datetime):
#         return db.convert_int_to_date(datetime)
#     return dict(format_date_main=format_date_main)


# # convert to conrency
# @app.context_processor
# def utility_processor():
#     def format_price(amount, currency=u"€"):
#         return "{:20,.0f}".format(amount, currency)
#     return dict(format_price=format_price)


#################################################################


class ItsdangerousSession(CallbackDict, SessionMixin):
    def __init__(self, initial=None):
        def on_update(self):
            self.modified = True
        CallbackDict.__init__(self, initial, on_update)
        self.modified = False

#################################################################

class ItsdangerousSessionInterface(SessionInterface):
    session_class = ItsdangerousSession

    def get_serializer(self, app):
        if not app.secret_key:
            return None
        return URLSafeTimedSerializer(app.secret_key,
                                      signer_kwargs = { "key_derivation": "hmac" })

    def open_session(self, app, request):
        s = self.get_serializer(app)
        if s is None:
            return None

        val = request.cookies.get(app.session_cookie_name)
        if not val:
            return self.session_class()

        max_age = app.permanent_session_lifetime.total_seconds()
        try:
            data = s.loads(val, max_age=max_age)
            return self.session_class(data)
        except BadSignature:
            return self.session_class()

    def save_session(self, app, session, response):
        domain = self.get_cookie_domain(app)
        if not session:
            if session.modified:
                response.delete_cookie(app.session_cookie_name, domain=domain)
            return
        expires = self.get_expiration_time(app, session)
        val = self.get_serializer(app).dumps(dict(session))
        response.set_cookie(app.session_cookie_name, val,
                            expires=expires, httponly=True, domain=domain)

app.session_interface = ItsdangerousSessionInterface()

#################################################################

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        is_ok = False

        if "session_id" in session:
            session_id = session.get("session_id")
            user_id = db.get_user_id(session_id)
            if user_id:
                g.user_id = user_id
                g.session_id = session_id
                g.user = db.get_user_info(user_id)
                if session:
                    is_ok = True

        if not is_ok:
            session.clear()
            scheme = request.headers.get("X-Forwarded-Proto", "http")
            url = scheme + "://" + request.host
            if request.path == "/sign_out":
                url += "/"
            return redirect("/login")

        return f(*args, **kwargs)
    return decorated_function




#################################################################

@app.route("/assets/<path:filename>")
def public_files(filename):
    src = os.path.dirname(__file__)
    return send_from_directory(os.path.join(src, "assets"), filename)

#################################################################

@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "GET":
        alert_message = session.pop("alert_message") if ("alert_message" in session) else None
        username  = session.pop("username") if ("username" in session) else None
        res = render_template("login.html", alert_message=alert_message, username=username)
        return make_response(res)

    else:
        username = request.form.get("username")
        password = md5(request.form.get("password")).hexdigest()
        resp, message = db.login(username, password)
    

        if resp is not False:
            session_id = resp
            user_id = db.get_user_id(session_id)
            user = db.get_user_info(user_id)

            session["user_id"] = str(user["_id"])
            # set session info page Active
            if True:
                session["session_id"] = session_id
                session["timestamp"] = time.time()
                session["user_id"] = str(user["_id"])
                return redirect("/")
        else:
            session["alert_message"] = message
            session["alert_type"] = "danger"
            session["username"] = username
            session["password"] = ""
            return redirect("/login")

#################################################################

@app.route("/sign_out")
@login_required
def sign_out():
    if g.user_id:
        db.sign_out(g.user_id)
    return redirect("/login")


#################################################################
#
#           Index Page:
# Show all Test Dialplan and their passed test cases.
#  
@app.route("/", methods = ["GET"])
@login_required

def index():
    try:
        searchString = request.args["search"]
    except:
        searchString = ""

    # Get dialplans
    testDialplanList = db.getTestDialplans(searchString, 1, index.pageSize)

    # Calculate page count
    count = db.getTestDialplanCount(searchString)
    pageCount = count // index.pageSize + (0 if count % index.pageSize == 0 else 1)

    # Count passed and total test cases
    # And then push all data into a list
    testDialplans = []
    count = testDialplanList.count(True)
    for i in range(count):
        # Get passed and total test cases
        info_test_case = testDialplanList[i].get("info_test_case")

        if info_test_case != None:
            passed = len([x for x in info_test_case if x["status"] == "passed"])
            total = len(info_test_case)
        else:
            passed = 0
            total = 0

            # Push data to list
        testDialplans.append((testDialplanList[i], passed, total))

    # Create response
    res = render_template(
        "index.html", 
        info_user = g.user, 
        test_dialplans = testDialplans, 
        page = 1, 
        page_count = pageCount,
        searchString = searchString
    )

    return make_response(res)

# Default page size for index page is 10 row
index.pageSize = 10

@app.route("/test_dialplans_list", methods=["POST"])
def test_dialplans_list():
    
    page = int(request.form["page"])
    searchString = request.form["search"]

    # Get dialplans
    testDialplanList = db.getTestDialplans(searchString, page, index.pageSize)

    # Calculate page count
    count = db.getTestDialplanCount(searchString)
    pageCount = count // index.pageSize + (0 if count % index.pageSize == 0 else 1)

    # Count passed and total test cases
    # And then push all data into a list
    testDialplans = []
    count = testDialplanList.count(True)
    for i in range(count):
        # Get passed and totoal test cases
        info_test_case = testDialplanList[i].get("info_test_case")

        if info_test_case != None:
            passed = len([x for x in info_test_case if x["status"] == "passed"])
            total = len(info_test_case)
        else:
            passed = 0
            total = 0

        # Push data to list
        testDialplans.append((testDialplanList[i], passed, total))

    # Create response
    res = render_template(
        "test_dialplans_list.html", 
        test_dialplans = testDialplans, 
        page = page, 
        page_count = pageCount,
        searchString = searchString
    )

    return make_response(res)

#################################################################
@app.route("/dependent_test_cases", methods = ["GET"])
@login_required
def dependent_test_cases():

    # Get Test dialplan ID from request
    testDialplanID = request.args.get("test_dialplan_id")
    testDialplan = db.getTestDialplan(testDialplanID)

    campaignName = db.getCampaignNameOfDialplan(testDialplanID)

    # Get list of ID and Name of Test dialplan
    testDialplanList = db.getTestDialplansIdAndName()

    # If not found Test dialplan ID from request then set it as the first of list
    if testDialplanID == None:
        testDialplanID = testDialplanList[0]["id"]

    testCaseOfDialplan = db.getTestCaseOfDialpan(testDialplan)

    testCaseList = []
    for tc in testCaseOfDialplan:

        i = None
        if testDialplan.get('info_test_case') != None: 
            i = next((i for i in testDialplan['info_test_case'] if i["id"] == tc["id"]), None)

        if i:
            testCaseList.append({
                "id": tc["id"],
                "name": tc["name"],
                "status": i["status"],
                "checked": True,
                "result": i["result"]
            })
            
        else:
            testCaseList.append({
                "id": tc["id"],
                "name": tc["name"],
                "status": "",
                "checked": False,
                "result": ""
            })
        

    # Create response
    res = render_template(
        "dependent_test_cases.html", 
        info_user = g.user,
        testDialplanList = testDialplanList,
        testDialplanID = testDialplanID,
        testCaseList = testCaseList,
        campaignName = campaignName
    )

    return make_response(res)

@app.route("/add_dependent_test_case", methods = ["POST"])
@login_required
def add_dependent_test_case():
    db.addTestCaseInfoOfDialplan(
        request.form["test_dialplan_id"],
        {
            "id": request.form["id"],
            "status": request.form["status"],
            "result": request.form["result"],
        }
    )

    return "true"

@app.route("/update_dependent_test_case", methods = ["POST"])
@login_required
def update_dependent_test_case():
    db.updateTestCaseInfoOfDialplan(
        request.form["test_dialplan_id"],
        {
            "id": request.form["id"],
            "status": request.form["status"],
            "result": request.form["result"],
        }
    )

    return "true"

@app.route("/remove_dependent_test_case", methods = ["POST"])
@login_required
def remove_dependent_test_case():
    try:
        db.removeTestCaseInfoOfDialplan(
            request.form["test_dialplan_id"],
            {
                "id": request.form["id"]
            }
        )

        return "true"

    except Exception as e:
        print(e)
        return "false"


@app.route("/run_test_case", methods = ["POST"])
@login_required
def run_test_case():

    testDialplanId = request.form.get('test_dialplan_id')

    

    pass
#################################################################
#
#           Delete Test Dialplan
#   
@app.route("/delete_test_dialplan", methods=["GET"])
@login_required
def delete_test_dialplan():
    testDialplanID = request.args.get("id")
    db.deleteTestDialplan(testDialplanID)
    return redirect("/")



#################################################################
#
#           Test Case page:
# Show test cases of specific Test dialplan
#
@app.route("/test_case", methods=["GET"])
@login_required

def test_case():
    
    # Get Test dialplan ID from request
    campaignID = request.args.get("campaign_id")
    if campaignID == None:
        campaignID = ""

    # Get list of ID and Name of Test dialplan
    campaignList = db.getCapaignsIdAndName()

    # Get all Test case of specific Test dialplan
    testCaseList = db.getTestCasesOfCampaign({"id": campaignID}, 1,test_case.pageSize)
    
    count = testCaseList.count()
    page_count = count // test_case.pageSize + (0 if count % test_case.pageSize == 0 else 1)

    # Create response
    res = render_template(
        "test_case.html",
        info_user = g.user,
        test_case_list = testCaseList,
        campaign_id = campaignID,
        campaigns = campaignList,
        page_count = page_count
    )

    return make_response(res)

test_case.pageSize = 10

@app.route("/test_cases_list", methods=["POST"])
@login_required

def test_cases_list():
    # Get Test dialplan ID from request
    campaignID = request.form["campaign_id"]

    page = int(request.form["page"])

    # Get all Test case
    testCaseList = db.getTestCasesOfCampaign({"id": campaignID}, page, test_case.pageSize)

    # Create response
    res = render_template(
        "test_cases_list.html",
        test_case_list = testCaseList
    )

    return make_response(res)

#################################################################
#           Create Test Case page:
#   Show the Create Test Case form
#
@app.route("/create_test_case", methods=["GET"])
@login_required

def create_test_case_get():

    campaigns = db.getCapaignsIdAndName()

    res = render_template(
        "create_test_case.html",
        info_user = g.user,
        campaigns = campaigns
    )

    return make_response(res)


#################################################################
#
#           Create Test Case page
#   Process post method to adding data to database
@app.route("/create_test_case", methods=["POST"])
@login_required

def create_test_case_post():
    try:
        # Insert test case
        testCase = {
            "id": uuid4().hex,
            "name": request.form["name"],
            "id_campaign": request.form["campaign_id"],
            "desc": request.form["description"],
            "require": bool(request.form.get("require")),
            "create_date": datetime.datetime.today(),
            "status": False
        }
        
        db.addTestCase(testCase)
        
        # Get number of call/listen dialplans depend on test case
        size = int(request.form["size"])

        # Insert call/listen dialplans
        for i in range(size):
            callListenScript = {
                "id": uuid4().hex,
                "id_test_case": testCase["id"],
                "type": request.form["scriptType_%d" % i],
                "machine": request.form["phone_%d" % i],
                "status": request.form["status_%d" % i],
            }

            db.addCallListenScript(callListenScript)

            # Get number of action in each call/listen dialplan
            size_ = int(request.form["size_%d" % i])

            # Insert actions
            for j in range(size_):
                db.addActionDialplan({
                    "id": uuid4().hex,
                    "id_call_listen": callListenScript["id"],
                    "name": request.form["action_%d_%d" % (i,j)],
                    "value": request.form["value_%d_%d" % (i,j)],
                    "result": request.form["result_%d_%d" % (i,j)],
                    "note": request.form["note_%d_%d"% (i,j)],
                })
    except Exception as e:
        print(e)

    # Back to test case page
    finally:
        return redirect("/test_case")

#################################################################
#
#       Delete url
#   Delete a test case and depenedent
@app.route("/delete_test_case", methods=["GET"])
@login_required

def delete():
    try:
        # Get id of test case
        id = request.args["id"]

        # Delete
        db.deleteTestCase(id)

    except Exception as e:
        print(e)

    finally:
        # Redirect to test dialplan page of deleted test case
        return redirect("/test_case")


###################################################################
#
#       Edit Test Case Page
#   Edit info a existed test case
@app.route("/edit_test_case", methods=["GET"])
@login_required

def edit_get():
    try:
        campaigns = db.getCapaignsIdAndName()

        # Get ID of Test Case
        id = request.args["id"]
        
        # Get Test Case and its dependent call/listen dialplans
        testCase = db.getTestCase(id)
        callListenScriptsList = db.getCallListenScriptsOfTestCase(id)

        # Get actions for each dialplan
        callListenScripts = []
        for i in range(callListenScriptsList.count()):
            actions = db.getActionsOfCallListenScript(callListenScriptsList[i]["id"])
            callListenScripts.append((callListenScriptsList[i], actions))

        # Create response
        res = render_template(
            "edit_test_case.html",
            info_user = g.user,
            test_case = testCase,
            call_listen_scripts = callListenScripts,
            campaigns = campaigns
        )
        
        return make_response(res)

    except Exception as e:
        print(e)
        return redirect("/")


###################################################################
#
#       Edit Test Case
#
@app.route("/edit_test_case", methods=["POST"])
@login_required

def edit_post():
    try:
        id = request.form["id"]

        # Delete Test Case and its dependents
        db.deleteTestCaseDependInfo(id)

        # Add new Test Case
        test_case = {
            "id": id,
            "name": request.form["name"],
            "id_campaign": request.form["campaign_id"],
            "desc": request.form["description"],
            "require": bool(request.form.get("require")),
            "create_date": datetime.datetime.today(),
            "status": False
        }

        db.updateTestCase(test_case)

        size = int(request.form["size"])

        for i in range(size):
            call_listen_script = {
                "id": uuid4().hex,
                "id_test_case": test_case["id"],
                "type": request.form["scriptType_%d" % i],
                "status": request.form["status_%d" % i],
                "machine": request.form["phone_%d" % i]
            }



            db.addCallListenScript(call_listen_script)

            size_ = int(request.form["size_%d" % i])

            for j in range(size_):
                db.addActionDialplan({
                    "id": uuid4().hex,
                    "id_call_listen": call_listen_script["id"],
                    "name": request.form["action_%d_%d" % (i,j)],
                    "value": request.form["value_%d_%d" % (i,j)],
                    "result": request.form["result_%d_%d" % (i,j)],
                    "note": request.form["note_%d_%d"% (i,j)],
                })
    except Exception as e:
        print(e)

    finally:
        return redirect("/test_case")


###################################################################

if __name__ == "__main__":
    try:
        port = int(sys.argv[1])
    except (TypeError, IndexError):
        port = 8089
    app.run(debug = True, host = "0.0.0.0", port = port)

