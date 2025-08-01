using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace com.esri.gpt.csw
{

    public class Spatial
    {
        public double[] bbox { get; set; }
        public string crs { get; set; }
    }
    public class Temporal
    {
        public string[] interval { get; set; }
        public string trs { get; set; }
    }

    public class Extent
    {
        public Spatial spatial { get; set; }
        public Temporal temporal { get; set; }
    }

    public class Link
    {
        public string rel { get; set; }
        public string type { get; set; }
        public string title { get; set; }
        public string href { get; set; }
    }

    [JsonArray]
    public class Geometry
    {
        //public string type { get; set; }
        public double lat { get; set; }
        public double lon { get; set; }
        //public double[][][] coordinates { get; set; }
    }


    public class Theme
    {
        public string scheme { get; set; }
        public string[] concept { get; set; }
    }

    public class Properties
    {
        public string type { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string language { get; set; }
        public DateTimeOffset created { get; set; }
        public DateTimeOffset updated { get; set; }
        public Theme[] theme { get; set; }
        public Extent extent { get; set; }
        public Link[] associations { get; set; }
    }

    public class Feature
    {
        public string type { get; set; }
        public string id { get; set; }
        public Properties properties { get; set; }
        public List<Geometry> Geometries { get; set; }
        public Link[] Links { get; set; }
    }

    public class FeatureCollection
    {
        public string Type { get; set; }
        public long numberReturned { get; set; }
        public long numberMatched { get; set; }
        public DateTimeOffset timeStamp { get; set; }
        public Feature[] features { get; set; }
    }
}
