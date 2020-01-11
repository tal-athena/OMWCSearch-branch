using System.Collections.Generic;

namespace OMWebiSearch.Areas.ViewModels
{
    public class PerformSearchViewModel
    {
        public int SearchProfileId { get; set; }
        public List<SearchParamClientInfo> Values { get; set; }
    }
}