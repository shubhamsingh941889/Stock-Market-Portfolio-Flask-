import requests
import json
from flask import Flask, request, jsonify, render_template
import requests
from datetime import datetime as dt_alias
from dateutil.relativedelta import relativedelta
import datetime
import time

app = Flask(__name__,static_folder='static')
MY_API_KEY = "c83f28iad3ift3bm8eq0"

@app.route('/', methods=['GET'])
def hello():
    """Return a friendly HTTP greeting."""
    return render_template('base.html')

@app.route("/company/<string:stock_name>", methods=['GET'])
def send_company_url_to_api(stock_name):
    company_api_data = company_req_api(stock_name)
    return jsonify(company_api_data)


@app.route("/summary/<string:stock_name>", methods=['GET'])
def send_summar_url_to_api(stock_name):
    summary_api_data = summary_req_api(stock_name)
    return jsonify(summary_api_data)  

@app.route("/charts/<string:stock_name>", methods=['GET'])
def send_charts_url_to_api(stock_name):
    charts_api_data = charts_req_api(stock_name)
    return jsonify(charts_api_data)

@app.route("/news/<string:stock_name>", methods=['GET'])
def send_news_url_to_api(stock_name):
    news_api_data = news_req_api(stock_name)

    return jsonify(news_api_data)  






def remove_decimals(value):
    if value is None:
        return None
    else:
        return "%.2f" % value
        
def company_req_api(keyword):
    
    company_url = "https://finnhub.io/api/v1/stock/profile2?symbol="+keyword+"&token="+MY_API_KEY
    company_json = requests.get(company_url).json()
    
    try:
        return {"logo": company_json["logo"],
            "name": company_json["name"],
            "ticker": company_json["ticker"],
            "exchange": company_json["exchange"],
            "ipo": company_json["ipo"],
            "finnhubIndustry": company_json["finnhubIndustry"]}

    except KeyError:
        return {}

def summary_req_api(keyword):
    stock_summary_url = "https://finnhub.io/api/v1/quote?symbol="+keyword+"&token="+MY_API_KEY
    company_url = "https://finnhub.io/api/v1/stock/profile2?symbol="+keyword+"&token="+MY_API_KEY
    recommendation_url = "https://finnhub.io/api/v1/stock/recommendation?symbol="+keyword+"&token="+MY_API_KEY
    company_json = requests.get(company_url).json()
    recommendation_json = requests.get(recommendation_url).json()

    if len(recommendation_json) ==0:
        return{}
    else:
        recommendation_json = recommendation_json[0]

    try:
        sumary_json = requests.get(stock_summary_url).json()
        date_from_stamp = datetime.datetime.fromtimestamp(sumary_json['t'])
        summ_date_req_format = ''
        summ_date_req_format+= str(date_from_stamp.day)+' '+date_from_stamp.strftime("%B")+', '+str(date_from_stamp.year)
    
        return { "ticker": company_json['ticker'],
                "summary_date": summ_date_req_format,
                "summary_pc": remove_decimals(sumary_json['pc']),
                "open": remove_decimals(sumary_json['o']),
                "high": remove_decimals(sumary_json['h']),
                "low": remove_decimals(sumary_json['l']),
                "change": remove_decimals(sumary_json['d']),
                "percent_change": remove_decimals(sumary_json['dp']),
                "strongSell":recommendation_json['strongSell'],
                "sell":recommendation_json['sell'],
                "hold":recommendation_json['hold'],
                "buy":recommendation_json['buy'],
                "strongBuy":recommendation_json['strongBuy']
                }
    except (KeyError,IndexError) as e:
        return {}

    

def charts_req_api(keyword):
    
    dt_today=dt_alias.today()
    dt_curr=relativedelta(months=6)
    dt_prior = dt_today - dt_curr
    unix_prior = int(time.mktime(dt_prior.timetuple()))
    unix_curr = int(time.mktime(dt_today.timetuple()))
    prior_date_without_time = dt_prior.strftime('%Y-%m-%d')

    charts_url = "https://finnhub.io/api/v1/stock/candle?symbol="+keyword+"&resolution=D&from="+str(unix_prior)+"&to="+str(unix_curr)+"&token="+MY_API_KEY
    
    response = requests.get(charts_url).json()

    if len(response)==1:
        return {}
    previous_data = []
    i = 0
    for i in range(len(response['t'])):
        de = int(response['t'][i])*1000
        previous_data.append([de, response['c'][i], int(response['v'][i])])
    
    return {'previous_data': previous_data, 'stock_name': keyword.upper(), 'prior_date': prior_date_without_time}

def news_req_api(keyword):
    
    final_news_details = []
    dt_today=dt_alias.today()
    dt_curr=relativedelta(months=6)
    dt_prior = dt_today - dt_curr
    from_date = dt_prior.strftime('%Y-%m-%d')
    to_date = dt_today.strftime('%Y-%m-%d')
    
    news_url = "https://finnhub.io/api/v1/company-news?symbol="+keyword+"&from="+from_date+"&to="+to_date+"&token="+MY_API_KEY
    
    response = requests.get(news_url).json()
    limit = 0
    if len(response)==0:
        return {}
    else:
        for firstrow in response:
            if limit==5:
                break
            all_news_details = get_news_details(firstrow)
            if (len(all_news_details))==4:
                final_news_details.append(all_news_details)
                limit+=1

    # print(final_news_details)
    return {'news_api_data': final_news_details}

def get_news_details(api_dict):
    return_dict = {}
    if "image" not in api_dict or "headline" not in api_dict or "datetime" not in api_dict or "url" not in api_dict:
        return {}
    else:
        if not api_dict['image'] or not api_dict['headline'] or api_dict['datetime']==0 or not api_dict['url']:
            return {}
        else:
            return_dict['title'] = api_dict['headline']
            return_dict['url'] = api_dict['url']
            return_dict['urlToImage'] = api_dict['image']
            date_from_stamp = datetime.datetime.fromtimestamp(api_dict['datetime'])
            date_req_format = ''
            date_req_format+= str(date_from_stamp.day)+' '+date_from_stamp.strftime("%B")+', '+str(date_from_stamp.year)
            return_dict['publishedAt'] = date_req_format
    return return_dict

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
    # app.run()