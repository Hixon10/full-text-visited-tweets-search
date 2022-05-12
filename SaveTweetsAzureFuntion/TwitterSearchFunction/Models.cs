using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace TwitterSearchFunction
{
    public class SaveTweet
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; }

        [JsonPropertyName("link")]
        public string Link { get; set; }
    }

    public class SaveTweetsRequest
    {
        [JsonPropertyName("tweets")]
        public List<SaveTweet> Tweets { get; set; }
    }
}
