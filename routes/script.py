import re
import xlrd
import requests
import json
import pandas as pd

s = requests.Session()
start = s.get('https://statisticsreports.ttac.ir/Product/ExportToExcelForGetProducts?pageNumber=1&pageSize=85000')
idsrv = re.findall('''xsrf&quot;,&quot;value&quot;:&quot;(.*?)&''', start.text)
data = {
    "idsrv.xsrf": idsrv[0],
    "username": "hoseini",
    "password": "S@jjad110"
}
login = s.post(url=start.url, data=data)
id_token = re.findall('''"id_token" value="(.*?)"''', login.text)
access_token = re.findall('''access_token" value="(.*?)"''', login.text)
token_type = re.findall('''token_type" value="(.*?)"''', login.text)
expires_in = re.findall('''expires_in" value="(.*?)"''', login.text)
scope = re.findall('''scope" value="(.*?)"''', login.text)
state = re.findall('''"state" value="(.*?)"''', login.text)
session_state = re.findall('''"session_state" value="(.*?)"''', login.text)
data = {
    "id_token": id_token[0],
    "access_token": access_token[0],
    "token_type": token_type[0],
    "expires_in": expires_in[0],
    "scope": scope[0],
    "state": state[0],
    "session_state": session_state[0]
}
fetch = s.post(url="https://statisticsreports.ttac.ir/dashboard/", data=data)
workbook = xlrd.open_workbook(file_contents=fetch.content)
worksheet = workbook.sheet_by_index(0)
product_list = []
dataFrame = pd.read_excel(workbook, dtype={'کد GTIN': object, 'کد IRC': object, 'تعداد در بسته': object, 'قیمت فروش به مصرف کننده': object, 'قیمت فروش به داروخانه': object, 'قیمت فروش به توزیع کننده': object})
dataFrame.fillna('', inplace=True)

for row in dataFrame.index:
    obj = {}
    obj['irc'] = dataFrame["کد IRC"][row]
    obj['gtn'] = dataFrame["کد GTIN"][row]
    obj['packageCount'] = dataFrame['تعداد در بسته'][row]
    obj['cPrice'] = dataFrame["قیمت فروش به مصرف کننده"][row]
    obj['dPrice'] = dataFrame["قیمت فروش به داروخانه"][row]
    obj['sPrice'] = dataFrame["قیمت فروش به توزیع کننده"][row]
    product_list.append(obj)

j = json.dumps(product_list)
with open('data.json', 'w') as f:
    f.write(j)

print("finish")
