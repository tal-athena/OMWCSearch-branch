using System.Collections.Generic;
using OMWCSearch;
using OMWSTypes;

namespace OMWebiSearch.Areas.ViewModels
{
    public class SearchProfilesViewModel
    {
        public IList<OMWPaneE> NavigationPanes { get; set; }

        public string RSSUrl { get; set; }

        public Dictionary<int, string> SearchProfiles { get; set; }

        public IEnumerable<OMWSearchHit> SearchHits { get; set; }
    }
}