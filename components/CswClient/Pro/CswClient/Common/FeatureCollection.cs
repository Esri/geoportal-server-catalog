using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace com.esri.gpt.csw
{

    public class Spatial
    {
        public double[][] bbox;
        public string crs;
    }
    public class Temporal
    {
        public string[] interval;
        public string trs;
    }

    public class Extent
    {
        public Spatial spatial;
        public Temporal temporal;
    }

    public class Link
    {
        public string rel;
        public string type;
        public string title;
        public string href;
    }

    public class Geometry
    {
        public string type;
        public double[][][] coordinates;
    }


    public class Theme
    {
        public string scheme;
        public string[] concept;
    }

    public class Properties
    {
        public string type;
        public string title;
        public string description;
        public string language;
        public DateTimeOffset created;
        public DateTimeOffset updated;
        public Theme[] theme;
        public Extent extent;
        public Link[] associations;
    }

    public class Feature
    {
        public string type;
        public string id;
        public Properties properties;
        public Geometry geometry;
        public Link[] links;
    }

    public class FeatureCollection
    {
        public string Type;
        public long numberReturned;
        public long numberMatched;
        public DateTimeOffset timeStamp;
        public Feature[] features;
    }
}
