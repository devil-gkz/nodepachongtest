'use strict';
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');

var express = require('express');
var app = express();

app.listen(process.env.PORT || 5000);

var targetUrl = 'http://www.tdxy.com.cn/index.php?m=content&c=index&a=lists&catid=19';

app.get('/',function(req,res,next){


	superagent.get(targetUrl).end(function(err,sres){
	if (err) {
		return console.error(err);
	};

	var topicUrls = [];
	var $ = cheerio.load(sres.text);
	$('.content_rc li a').each(function(idx, element){
		var $element = $(element);
		topicUrls.push($element.attr('href'));
	});
	

	// 获取所有的url完成之后
	var ep = new eventproxy();

	ep.after('topic_html',topicUrls.length, function(topics){
		topics = topics.map(function (topicPair){
			var topicUrl = topicPair[0];
			var topicHtml = topicPair[1];
			var $ = cheerio.load(topicHtml);
			return ({
				title: $('.content_zy_1 p').first().text().trim(),
				from : $('.content_zy_1 p').last().text().trim(),
				text : $('.content_zy_1 div span').text().trim(),
		});
		});
		console.log('final: ');
		console.log(topics);
		res.send(topics);
	});

	topicUrls.forEach(function(topicUrl){
		superagent.get(topicUrl).end(function(err,res){
			if (err) {
				// console.log('有错误' + err);
				return console.error(err);
			};
			console.log('fetch ' + topicUrl + ' successful');
			ep.emit('topic_html', [topicUrl, res.text]);
		});
	});
});
});



