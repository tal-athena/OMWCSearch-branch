using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OMWebiSearch.Areas.Search.Models
{
    public class MobileSearchContextListParam
    {
        public string Id { get; set; }
        public string Value { get; set; }
    }
    public class MobileSearchContext
    {
        public int SearchProfileId { get; set; }
        public string SearchProfileName { get; set; }
        public List<MobileSearchContextListParam> SearchParams { get; set; }
    }
}