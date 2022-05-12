# Full text search in visited tweets

How it works:
1. You visit tweets.
2. Firefox extension try to save currently opened Tweets to [Azure Cognitive Search](https://azure.microsoft.com/en-us/services/search/) every N seconds. 
3. When you need, you open `Azure Search explorer`, and execute arbitrary search query.
4. This solution could be almost free, if you are OK with `50 MB` total tweets index size.

You need:
1. Create `Azure Cognitive Search` service in your Azure subscription.
2. Create search `index` in your search service:
```
{
  "name": "tweets-index",
  "fields": [
    {
      "name": "id",
      "type": "Edm.String",
      "facetable": false,
      "filterable": false,
      "key": true,
      "retrievable": true,
      "searchable": false,
      "sortable": false,
      "analyzer": null,
      "indexAnalyzer": null,
      "searchAnalyzer": null,
      "synonymMaps": [],
      "fields": []
    },
    {
      "name": "content",
      "type": "Edm.String",
      "facetable": false,
      "filterable": false,
      "key": false,
      "retrievable": true,
      "searchable": true,
      "sortable": false,
      "analyzer": "standard.lucene",
      "indexAnalyzer": null,
      "searchAnalyzer": null,
      "synonymMaps": [],
      "fields": []
    },
    {
      "name": "link",
      "type": "Edm.String",
      "facetable": false,
      "filterable": false,
      "key": false,
      "retrievable": true,
      "searchable": false,
      "sortable": false,
      "analyzer": null,
      "indexAnalyzer": null,
      "searchAnalyzer": null,
      "synonymMaps": [],
      "fields": []
    }
  ],
  "suggesters": [],
  "scoringProfiles": [],
  "defaultScoringProfile": "",
  "corsOptions": null,
  "analyzers": [],
  "charFilters": [],
  "tokenFilters": [],
  "tokenizers": [],
  "similarity": {
    "@odata.type": "#Microsoft.Azure.Search.BM25Similarity",
    "k1": null,
    "b": null
  },
  "encryptionKey": null,
  "semantic": null,
  "normalizers": [],
  "@odata.etag": "\"0x8DA33A03A887954\""
}
```
3. Set the following setting for your Azure function:
```
SearchApiKey = YOUR_API_KEY
SearchIndexName = tweets-index
SearchServiceName = tweetssearch
```
4. Deploy Azure function `SaveTweetsAzureFuntion` to your Azure subscription. 
5. Set Azure function URL in `firefox-addon/script.js` - `SAVE_NEW_TWEETS_INTERVAL_IN_MS`.
6. Build Firefox extension `firefox-addon`.
7. Use twitter as usual. 
8. Open azure portal, go to your search service and use `Search explorer` to search something in your visited tweets.  