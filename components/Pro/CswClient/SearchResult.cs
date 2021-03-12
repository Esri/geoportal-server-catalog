using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoportalSearch
{
  class SearchResult
  {
    public long start { get; set; }
    public long num { get; set; }
    public long total { get; set; }
    public long nextStart { get; set; }
    public string sourceType { get; set; }
    public string sourceKey { get; set; }

    public List<SearchResultItem> results { get; set; }
  }
}
