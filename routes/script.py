import re
import xlrd
import requests
import json
import pandas as pd
import pymongo

s = requests.Session()
start = s.get('https://statisticsreports.ttac.ir/Product/ExportToExcelForGetProducts?pageNumber=1&pageSize=85000')
idsrv = re.findall('''xsrf&quot;,&quot;value&quot;:&quot;(.*?)&''', start.text)
data = {
    "idsrv.xsrf": idsrv[0],
    "username": "az1357",
    "password": "az13577"
#     "username": "hoseini",
#     "password": "H0seini@"
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
    obj['brandOwner'] = dataFrame["نام صاحب برند"][row]
    obj['enBrandName'] = dataFrame["نام لاتین برند"][row]
    obj['faBrandName'] = dataFrame["نام برند"][row]
    obj['packageCount'] = dataFrame["تعداد در بسته"][row]
    obj['enLicenceOwner'] = dataFrame["نام لاتین شرکت تامین کننده"][row]
    obj['faLicenceOwner'] = dataFrame["نام شرکت تامین کننده"][row]
    obj['faProducer'] = dataFrame["نام شرکت تولید کننده"][row]
    obj['enProducer'] = dataFrame["نام لاتین شرکت تولید کننده"][row]
    obj['isBulk'] = dataFrame["IsBulk"][row]
    obj['enName'] = dataFrame["نام لاتین فهرست"][row]
    obj['genericName'] = dataFrame['نام ژنریک'][row]
    obj['genericCode'] = dataFrame['کد ژنریک'][row]
#     obj['packageCount'] = dataFrame['موقت'][row]
    obj['atc'] = dataFrame['کد ATC'][row]
    obj['officialCode'] = dataFrame['Official Code'][row]
    obj['statusType'] = dataFrame['وضعیت'][row]
    obj['category'] = dataFrame['نوع فرآورده'][row]
    obj['cPrice'] = dataFrame["قیمت فروش به مصرف کننده"][row]
    obj['dPrice'] = dataFrame["قیمت فروش به داروخانه"][row]
    obj['sPrice'] = dataFrame["قیمت فروش به توزیع کننده"][row]
    product_list.append(obj)

j = json.dumps(product_list)
with open('data.json', 'w') as f:
    f.write(j)

print("get price successfully from TTAC.")
