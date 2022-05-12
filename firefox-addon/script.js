
//document.body.style.border = "5px solid red";

const API_URL = "URL";

const SAVE_NEW_TWEETS_INTERVAL_IN_MS = 2000;

const existedTweetIds = new Set();

setInterval(function () {
	// TODO
	// 1. improve tweetId parsing performance
	// 2. improve tweets content cleaning (we have a lot of unnecessary words and symbols, which could be removed). 
 
	const tweetIdToContent = new Map();
	const tweetIdToLink = new Map();
 
	const articles = document.getElementsByTagName('article');
	for (var i = 0; i < articles.length; i++) {
		const links = articles[i].getElementsByTagName('a');
		const tweetIds = getTweetIdsFromTimeline(links); 
		if (tweetIds.length != 1) {
			continue;
		}
		
		const tweetIdObject = tweetIds[0];
		const tweetId = tweetIdObject["tweetId"];
		if (existedTweetIds.has(tweetId)) {
			continue;
		}
		existedTweetIds.add(tweetId);
		
		const textWords = getText(articles[i]);
		const filteredText = textWords.filter((word) => { 
			if (word == "Twitter Web App") {
				return false;
			}
			
			if (word.startsWith("Replying to")) {
				return false;
			}
			
			if (word == "Twitter Web App") {
				return false;
			}
			
			if (word == "Quote Tweet") {
				return false;
			}
			
			var isWordNotNumber = true;
			for (var j = 0; j < word.length; j++) {
				if (!isCharNumber(word[j])) {
					isWordNotNumber = false;
					break;
				}
			}
			
			if (isWordNotNumber) {
				return false;
			}
			
			return true;
		}).join(" ");
		
		const content = JSON.stringify(filteredText)
		  .replace(/["']/g, "")
		  .replace(/\n/g, "")
		  .replace(/\\/g, "")
		  .replace(/ nn/g, "");
		tweetIdToContent.set(tweetId, content);
		tweetIdToLink.set(tweetId, tweetIdObject["link"]);
		//console.log("New tweetId found: content = " + content + ", tweetId =" + tweetId);
	}
	
	const maybeNewTweetIds = Array.from(tweetIdToContent.keys());
	if (maybeNewTweetIds.length == 0) {
		//console.log("maybeNewTweetIds.length == 0");
		return;
	}
	
	const retrievePromise = browser.storage.local.get(maybeNewTweetIds);
	
	function onError(error) {
	  console.log(`Error from storage: ${error}`); 
	}
	
	function itemSaved(item) {
	  console.log("Items saved to storage");
	}
	
	function onGot(item) {
		for (var i = 0; i < maybeNewTweetIds.length; i++) {
			if (item[maybeNewTweetIds[i]] != null) {
				tweetIdToContent.delete(maybeNewTweetIds[i]);
			}
		}
		
		if (tweetIdToContent.size == 0) {
			console.log("There are no tweets for sending");
			return;
		}
		
		browser.storage.local.set(Object.fromEntries(tweetIdToContent))
			.then(itemSaved, onError);
			
		const result = {};
		result["tweets"] = [];
		
		for (const [key, value] of tweetIdToContent.entries()) {
		  const tweet = {};
		  tweet["id"] = key;
		  tweet["content"] = value;
		  tweet["link"] = tweetIdToLink.get(key);
		  result["tweets"].push(tweet);
		}
			
		const requestAsJson = JSON.stringify(result);	
		console.log("Prepare to send: " + requestAsJson);
		
		postData(API_URL, requestAsJson)
		  .then(res => console.log("saved in azure: " + JSON.stringify(res)));
	}
	
	retrievePromise.then(onGot, onError);

}, SAVE_NEW_TWEETS_INTERVAL_IN_MS);


// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Example POST method implementation:
async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: data 
  });
  return response;
}


// https://stackoverflow.com/a/23030157/1756750
function getText(node) {
    function recursor(n) {
        var i, a = [];
        if (n.nodeType !== 3) {
            if (n.childNodes)
                 for (i = 0; i < n.childNodes.length; ++i)
                     a = a.concat(recursor(n.childNodes[i]));
        } else
            a.push(n.data);
        return a;
    }
    return recursor(node);
} 
 
function getTweetIdFromDetailsPage(links) {
	for (var i = 0; i < links.length; i++) {
		const linkHref = links[i].href;
		
		if (!linkHref.endsWith("/likes")) {
			continue;
		}
		
		const parts = linkHref.split('/');
		if (parts.length < 3) {
			continue;
		}
		
		if (parts[parts.length - 3] != "status") {
			continue;
		}
		
		const tweetId = parts[parts.length - 2];
		var isTweetId = true;
		for (var j = 0; j < tweetId.length; j++) {
			if (!isCharNumber(tweetId[j])) {
				isTweetId = false;
				break;
			}
		}
		
		if (!isTweetId) {
			continue;
		}
		
		return tweetId;
	}	
	
	return null;
}
 
function getTweetIdsFromTimeline(links) {
	const result = [];

	for (var i = 0; i < links.length; i++) {
		//if (true) {
		// if (links[i].children.length == 1 && links[i].children[0].nodeName === "TIME") {
			const linkHref = links[i].href;
			if (!linkHref.startsWith("https://twitter.com/")) {
				continue;
			}
			
			const parts = linkHref.split('/');
			if (parts[parts.length - 2] != "status") {
				continue;
			}
			
			const tweetId = parts[parts.length - 1];
			var isTweetId = true;
			for (var j = 0; j < tweetId.length; j++) {
				if (!isCharNumber(tweetId[j])) {
					isTweetId = false;
					break;
				}
			}
			
			if (!isTweetId) {
				continue;
			} 
			
			result.push({"tweetId": tweetId, "link": linkHref});
		//}
	}
	
	return result;
}

function isCharNumber(c) {
  return c >= '0' && c <= '9';
}