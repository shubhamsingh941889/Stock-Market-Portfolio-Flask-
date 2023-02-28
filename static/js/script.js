var ValidResult = document.getElementById("valid-result");
var NoResult = document.getElementById("no-result");
var CompanyData = document.getElementById("company-data");
var SummaryData = document.getElementById("summary-data");
var ChartsData = document.getElementById("charts-data");
var NewsData = document.getElementById("news-data");
var ArrowDownIcon = "../static/img/RedArrowDown.png";
var ArrowUpIcon = "../static/img/GreenArrowUp.png";
var SearchArea = document.getElementById('search-area');
var CrossIcon = document.getElementById('cross-btn');

CrossIcon.addEventListener('click', reset, false)

function searchapi(event) {
    var stock_name = (SearchArea.value.trim()).toUpperCase();
    event.preventDefault();
    clear_nav_links();
    NoResult.style.display = "none";
    ValidResult.style.display = "none";
    flask_server_req("/company/" + stock_name, display_company_data);
    SummaryData.style.display = "none";
    flask_server_req("/summary/" + stock_name, display_summary_data);
    ChartsData.style.display = "none";
    flask_server_req("/charts/" + stock_name,  display_charts_data);
    NewsData.style.display = "none";
    flask_server_req("/news/" + stock_name, display_news_data);
    
}

function reset(event) {
    ValidResult.style.display = "none";
    NoResult.style.display = "none";
    clear_nav_links();
}

function get_noresult_view() {
    if (NoResult.style.display === "block") {
        return "on";
    } else if (NoResult.style.display === "none") {
        return "off";
    } 
}

function nav_open_tab(evt, nav_name) {
    
    nav_content = document.getElementsByClassName("nav-returned-data");
    var i, nav_content, nav_bar_links;
    if (get_noresult_view() === "off") {
        for (i = 0; i < nav_content.length; i++) {
            nav_content[i].style.display = "none";
        }

        nav_bar_links = document.getElementsByClassName("nav-links");
        for (i = 0; i < nav_bar_links.length; i++) {
            nav_bar_links[i].className = nav_bar_links[i].className.replace(" active", "");
        }
        document.getElementById(nav_name).style.display = "block";
        evt.currentTarget.className += " active";
    }
}

function clear_nav_links() {
    var nav_bar_links, i, company_link;
    nav_bar_links = document.getElementsByClassName("nav-links");
    for (i = 0; i < nav_bar_links.length; i++) {
        nav_bar_links[i].className = nav_bar_links[i].className.replace(" active", "");
    }
    company_link = nav_bar_links[0];
    company_link.className = "nav-links active";
}

function display_company_data(response) {
    NoResult.style.display = "none";
    ValidResult.style.display = "none";
    if (Object.keys(response).length === 0) {
        NoResult.style.display = "block";
    } 
    else {
        CompanyData.style.display = "block";
        all_company_details = ''
        all_company_details+='<img class="outlook-img" src="'+response["logo"]+'"<br><br><table>'
        all_company_details += "<tr><th>Company Name</th><td>" + response["name"] + "</td></tr>";
        all_company_details += "<tr><th>Stock Ticker Symbol</th><td>" + response["ticker"] + "</td></tr>";
        all_company_details += "<tr><th>Stock Exchange Code</th><td>" + response["exchange"] + "</td></tr>";
        all_company_details += "<tr><th>Company IPO Date</th><td>" + response["ipo"] + "</td></tr>";
        all_company_details += "<tr><th>Category</th><td>" + response["finnhubIndustry"] + "</td></tr>";
        all_company_details += "<tr></tr><tr></tr><tr></tr><tr></tr></table>";
        CompanyData.innerHTML = all_company_details;
        ValidResult.style.display = "block";
    }
}


function display_summary_data(response) {
    if (Object.keys(response).length === 0) {
        NoResult.style.display = "block";
    } 
    else {
        var all_csummary_details = "<table>";
        all_csummary_details += "<tr><th>Stock Ticker Symbol</th><td>" + response["ticker"] + "</td></tr>";
        all_csummary_details += "<tr><th>Trading Day</th><td>" + response["summary_date"] + "</td></tr>";
        all_csummary_details += "<tr><th>Previous Closing Price</th><td>" + response["summary_pc"] + "</td></tr>";
        all_csummary_details += "<tr><th>Opening Price</th><td>" + response["open"] + "</td></tr>";
        all_csummary_details += "<tr><th>High Price</th><td>" + response["high"] + "</td></tr>";
        all_csummary_details += "<tr><th>Low Price</th><td>" + response["low"] + "</td></tr>";
        all_csummary_details += "<tr><th>Change</th><td>" + response["change"];
        if (response["change"] != null) {
            if (response["change"][0] === "-") {
                all_csummary_details += "<img src='" + ArrowDownIcon + "' class='arrow-img'>";
            } else {
                all_csummary_details += "<img src='" + ArrowUpIcon + "' class='arrow-img'>";
            }
        } 

        all_csummary_details += "</td></tr>";
    
        all_csummary_details += "<tr><th>Change Percent</th><td>" + response["percent_change"];
        if (response["percent_change"] != null) {
            if (response["percent_change"][0] === "-") {
                all_csummary_details += "<img src='" + ArrowDownIcon + "' class='arrow-img'>";
            } else {
                all_csummary_details += "<img src='" + ArrowUpIcon + "' class='arrow-img'>";
            }
        }

        all_csummary_details += "</td></tr>";
        
        all_csummary_details += "</table>";

        all_csummary_details += "<div class='recommendation'>";
        all_csummary_details+= "<div id='selltext'>Strong Sell</div>"
        all_csummary_details += "<div class='strongSell'>"+response['strongSell']+"</div>";
        all_csummary_details += "<div class='sell'>"+response['sell']+"</div>";
        all_csummary_details += "<div class='hold'>"+response['hold']+"</div>";
        all_csummary_details += "<div class='buy'>"+response['buy']+"</div>";
        all_csummary_details += "<div class='strongBuy'>"+response['strongBuy']+"</div>";
        all_csummary_details+="<div id='buytext'>Strong Buy</div></div>";
        all_csummary_details+="<div id='trendstext'>Recommendation Trends</div>";

        SummaryData.innerHTML = all_csummary_details;
    }
}

function display_charts_data(response) {
    
    if (response["previous_data"].length === 0) {
        NoResult.style.display = "block";
    } else {
        
        var all_past_data = response["previous_data"]; 
        var stock_name = response['stock_name'];
        var previous_date = response['prior_date'];

        var arr_volume = [], arr_close_price = [];
        var i;

        for (i = 0; i < all_past_data.length; i += 1) {

            arr_volume.push([
                all_past_data[i][0], 
                all_past_data[i][2] 
            ]);

            arr_close_price.push([
                all_past_data[i][0], 
                all_past_data[i][1] 
            ]);

        }

        Highcharts.stockChart('charts-area', {
            stockTools: {
                gui: {
                    enabled: false
                }
            },
            
        
            
            rangeSelector: {
                buttons: [{
                    type: 'day',
                    count: 7,
                    text: '7d'
                }, {
                    type: 'day',
                    count: 15,
                    text: '15d'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }],
                selected: 0,
                inputEnabled: false,
                allButtonsEnabled: true,
                
            },

            xAxis: {
                type: 'datetime',
                labels: {
                    format: '{value:%e. %b}'
                }
            },

            yAxis: [{
                title: {text: 'Volume', align: "middle"},
                labels: {align: 'left'}, 
                tickAmount:6,
                offset:0

            }, {
                title: {text: 'Stock Price', align: "middle"},
                opposite: false,
                resize:{enabled:true},
                tickAmount:6
                
            }],

            title: {text: 'Stock Price ' + stock_name + ' ' + previous_date},

            subtitle: {
                text: '<a href="https://finnhub.io/" target="_blank">Source: Finnhub</a>',
                useHTML: true
            },

            plotOptions: {
                column: {
                    pointWidth: 2,
                    color: '#404040',
                    pointPlacement:"on"
                }
            },


            series: [{
                type: 'area',
                name: stock_name,
                data: arr_close_price,
                threshold: null,
                yAxis: 1,
                showInNavigator: true,
                tooltip: {
                    valueDecimals: 2
                },
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
            },
                {
                    type: 'column',
                    name: stock_name + ' Volume',
                    data: arr_volume,
                    dataGrouping:{
                        anchor:"start",
                    }
                }]


        });
    }
}


function display_news_data(response) {
    if (response["news_api_data"].length === 0) {
        NoResult.style.display = "block";
    } 
    else{
    
    var arr_news = response["news_api_data"];

    var latestNews = "";
    var i;
    for (i = 0; i < arr_news.length; i++) {
        latestNews += "<div class='news-main'><div class='news-img'>";
        latestNews += "<img class='news-img' src='" + arr_news[i]["urlToImage"] + "'/></div>";
        latestNews += "<div class='news-text'><p><b>" + arr_news[i]["title"] + "</b></p>";
        latestNews += "<p><span>" +arr_news[i]["publishedAt"] + "</span></p>";
        latestNews += "<p><a href='" + arr_news[i]["url"] + "' target='_blank'>See Original Post</a></p>";
        latestNews += "</div></div>";

    }
    NewsData.innerHTML = latestNews;
    }
}


function flask_server_req(req_url,display_method) {
    var xhtml = new XMLHttpRequest();
    xhtml.onreadystatechange = function () {
        if (xhtml.readyState === 4 && xhtml.status === 200) {
            display_method(JSON.parse(xhtml.responseText));
        } 
    };
    xhtml.open("GET", req_url);
    xhtml.send();
}












