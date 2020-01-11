using System.Collections.Generic;
using OMWCSearch.ViewTypes;
using OMWSTypes;

namespace OMWebiSearch.Areas.ViewModels
{
    public class SearchMainPageViewModel : PageViewModelBase
    {
        public Dictionary<int, string> SearchProfiles { get; set; }

        public IEnumerable<OMWSearchHit> SearchHits { get; set; }

        public string RSSUrl { get; set; }

        public OMWCGridView GridView { get; set; }
    }
}