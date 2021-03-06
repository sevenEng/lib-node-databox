const https = require('https');
const url = require('url');
const fs = require('fs');
const request = require('request');
const promiseRetry = require('promise-retry');

var arbiterURL   = process.env.DATABOX_ARBITER_ENDPOINT;
var hostname     = process.env.DATABOX_LOCAL_NAME;
var arbiterToken = fs.readFileSync("/run/secrets/ARBITER_TOKEN",{encoding:'base64'});

// Modify component URLs if not dunning in Docker
if (!require('containerized')()) {
	console.warn("Warning: Running outside Docker; Databox hostnames will be replaced with 'localhost'");
	if (arbiterURL)
		arbiterURL = arbiterURL.replace(url.parse(arbiterURL).hostname, 'localhost');
}

// Configure HTTPS agent (as in stores)
const CM_HTTPS_CA_ROOT_CERT = fs.readFileSync("/run/secrets/DATABOX_ROOT_CA");
var agentOptions = {};
if (!CM_HTTPS_CA_ROOT_CERT) {
	console.warn('Warning: No HTTPS root certficate provided so Databox HTTPS certificates will not be checked');
	agentOptions.rejectUnauthorized = false;
} else {
	agentOptions.ca = CM_HTTPS_CA_ROOT_CERT;
}
exports.httpsAgent = new https.Agent(agentOptions);

exports.getHttpsCredentials = function() {

	let credentials = {};

	try {
		//HTTPS certs created by the container mangers for this components HTTPS server.
		credentials = {
			key:  fs.readFileSync("/run/secrets/DATABOX.pem") || '',
			cert: fs.readFileSync("/run/secrets/DATABOX.pem") || ''
		};
	} catch (e) {
		console.warn('Warning: No HTTPS certficate not provided HTTPS certificates missing.');
		credentials = {};
	}

	return credentials
}

exports.makeArbiterRequest = function(method, path, json) {
	return new Promise((resolve, reject) => {
		request({
			method: method,
			url: arbiterURL + path,
			json: json,
			headers: { 'X-Api-Key': arbiterToken },
			agent: exports.httpsAgent
		}, (err, res, body) => {
			if (err || res.statusCode !== 200) {
				reject(err || body);
				return;
			}
			resolve(body);
		});
	});
};

exports.makeStoreRequest = function() {
	var tokenCache = {};

	return (options) => {
		var route = {
			target: url.parse(options.url).hostname,
			path:   url.parse(options.url).pathname,
			method: options.method || 'GET'
		};
		var routeHash = JSON.stringify(route);

		return new Promise((resolve, reject) => {
			Promise.resolve().then(() => {
				if (!(routeHash in tokenCache))
					return exports.requestToken(route.target, route.path, route.method);
				return tokenCache[routeHash];
			}).then((token) => {
				options.agent = exports.httpsAgent;
				options.headers = options.headers || {};
				options.headers['X-Api-Key'] = tokenCache[routeHash] = token;

				return new Promise((resolve, reject) => {
					request(options, (err, res, body) => {
						if (err || (res.statusCode < 200 || res.statusCode >= 300)) {
							reject(err || body || "[API Error]" + res.statusCode);
							return;
						}
						resolve(body);
					});
				});
			}).then((body) => {
				resolve(body)
			}).catch((err) => {
				// TODO: If request was rejected because a token is expired, remove it from tokenCache so it can be renewed
				reject(err)
			});
		});
	};
}();

exports.requestToken = function(hostname, endpoint, method) {
	return exports.makeArbiterRequest('POST', '/token', {
		target: hostname,
		path:   endpoint,
		method: method
	});
};

exports.waitForStoreStatus = function (href, status, maxRetries) {
	href = (url => url.protocol + '//' + url.host)(url.parse(href));
	return promiseRetry(function (retry, number) {
		return exports.makeStoreRequest({
			method: 'GET',
			url: href + '/status'
		}).then((body) => {
			if (body !== status)
				retry('[waitForStoreStatus] Poll #' + number + ' failed: status is ' + body + ' not ' + status);
		}).catch(function (err) {
			console.error(err.retried || err);
			console.log('[waitForStoreStatus] Retrying in 1s...');
			retry(err);
		});
	}, { retries: maxRetries, factor: 1 });
};
