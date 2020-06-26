# -*- coding: utf-8 -*-
import os
import datetime
from json import dumps
import time
import ast
import json
import math
from uuid import uuid4
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

#fake data for test
import fake_data

app.config["SECRET_KEY"] = config.SECRET_KEY
app.config["SESSION_COOKIE_DOMAIN"] = config.SESSION_COOKIE_DOMAIN
sentry = Sentry(app)
app.jinja_env.add_extension("jinja2.ext.do")

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


@app.context_processor
def utility_processor():
    def get_current_date():
        return db.get_current_datetime("time")
    return dict(get_current_date=get_current_date)



@app.context_processor
def utility_processor():
    def format_date(datetime):
        return db.convert_int_to_time(datetime)
    return dict(format_date=format_date)


@app.context_processor
def utility_processor():
    def format_date_main(datetime):
        return db.convert_int_to_date(datetime)
    return dict(format_date_main=format_date_main)


# convert to conrency
@app.context_processor
def utility_processor():
    def format_price(amount, currency=u"€"):
        return "{:20,.0f}".format(amount, currency)
    return dict(format_price=format_price)





class ItsdangerousSession(CallbackDict, SessionMixin):
    def __init__(self, initial=None):
        def on_update(self):
            self.modified = True
        CallbackDict.__init__(self, initial, on_update)
        self.modified = False



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


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        is_ok = False
        if "session_id" in session:
            session_id = session.get("session_id")
            user_id = db.get_user_id(session_id)
            user = None
            if user_id:
                g.user_id = user_id
                g.session_id = session_id
                g.user = db.get_user_info(user_id)
                if session:
                    is_ok = True
                user =  g.user
        if not is_ok:
            session.clear()
            scheme = request.headers.get("X-Forwarded-Proto", "http")
            url = scheme + "://" + request.host
            if request.path == "/sign_out":
                url += "/"
            return redirect("/login")

        return f(*args, **kwargs)
    return decorated_function






@app.route("/assets/<path:filename>")
def public_files(filename):
    src = os.path.dirname(__file__)
    return send_from_directory(os.path.join(src, "assets"), filename)


@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "GET":
        alert_message = session.pop("alert_message") \
                if "alert_message" in session else None
        username  = session.pop("username") \
                if "username" in session else None
        res = render_template("login.html", alert_message=alert_message, username=username)
        response = make_response(res)
        return response

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



@app.route("/sign_out")
@login_required
def sign_out():
    if g.user_id:
        db.sign_out(g.user_id)
    return redirect("/login")




@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    info_user = g.user
     
    page = request.args.get("page")
    try:
        page = int(page)
    except:
        page = 1

    ts_from = (page - 1) * index.page_size
    ts_to = page * index.page_size

    page_count = int(ceil(fake_data.test_script_list.__len__() / float(index.page_size)))

    test_script_list = fake_data.test_script_list[ts_from : ts_to]

    res = render_template(
        "index.html", 
        info_user = info_user, 
        test_script_list = test_script_list, 
        page = page, 
        page_count = page_count
    )

    response = make_response(res)

    return response

index.page_size = 10


@app.route("/test_case", methods=["GET", "POST"])
@login_required
def test_case():
    info_user = g.user
    
    test_case_list = fake_data.test_case_list
    test_script_list = fake_data.test_script_list

    test_script_id = request.args.get("test_script_id")
    
    try:
        test_script_id = int(test_script_id)
    except:
        test_script_id = test_script_list[0]['_id']

    return render_template(
        "test_case.html",
        info_user = info_user,
        test_case_list = test_case_list,
        test_script_list = test_script_list,
        test_script_id = test_script_id
    )

@app.route("/create_test_case", methods=["GET", "POST"])
@login_required
def create_test_case():
    info_user = g.user

    return render_template(
        "create_test_case.html",
        info_user = info_user,
    )

if __name__ == "__main__":
    try:
        port = int(sys.argv[1])
    except (TypeError, IndexError):
        port = 8089
    app.run(debug=True, host="0.0.0.0", port=port)

