using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Azure.Search.Documents;
using Azure;
using System.Text.Json;

namespace TwitterSearchFunction
{
    public static class SaveTweets
    {
        private static string searchApiKey = Environment.GetEnvironmentVariable("SearchApiKey", EnvironmentVariableTarget.Process);
        private static string searchServiceName = Environment.GetEnvironmentVariable("SearchServiceName", EnvironmentVariableTarget.Process);
        private static string searchIndexName = Environment.GetEnvironmentVariable("SearchIndexName", EnvironmentVariableTarget.Process);


        [FunctionName("SaveTweets")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.: ");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var tweetsSaveRequest = JsonSerializer.Deserialize<SaveTweetsRequest>(requestBody);

            // Cognitive Search 
            Uri serviceEndpoint = new Uri($"https://{searchServiceName}.search.windows.net/");
            
            SearchClient searchClient = new SearchClient(
                serviceEndpoint,
                searchIndexName,
                new AzureKeyCredential(searchApiKey)
            );

            _ = await searchClient.MergeOrUploadDocumentsAsync(tweetsSaveRequest.Tweets);

            return new OkObjectResult("ok");
        }
    }
}
