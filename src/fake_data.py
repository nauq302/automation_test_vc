
import datetime

test_script_list = []
for i in range(1, 30):
    test_script_list.append({
        "_id": i,
        "name": "Test script %d" % i,
        "test_date": datetime.date(2020, 6, i),
        "test_account": {
            "username": "username %d" % i 
        },
        "passed_test_cases": {
            "pass": i,
            "total": i if (i % 3 == 0) else (i + 1)
        },
        "hotline_number": "%010d" % i
    })

test_case_list = []
for i in range(1, 10):
    test_case_list.append({
        "_id": i,
        "name": "Test case %d" % i,
        "test_script_name" : "hix",
        "create_date": datetime.date(2020, 6, i),
        "status": bool(i % 2),
        "note": "Nothing"
    })

action_list = []