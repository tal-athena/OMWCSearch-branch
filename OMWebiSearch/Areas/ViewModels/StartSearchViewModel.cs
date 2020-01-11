using System.Collections.Generic;

namespace OMWebiSearch.Areas.ViewModels
{
    using OMWCSearch.Enums;

    public class StartSearchViewModel
    {
        public int SearchProfileId { get; set; }
        public SearchResultsType ResultsType { get; set; }
        public List<SearchParamClientInfo> Values { get; set; }
    }
}