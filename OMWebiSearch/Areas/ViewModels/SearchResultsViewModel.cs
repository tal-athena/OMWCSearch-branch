using System.Collections.Generic;
using System.Web.Script.Serialization;
using OMWSTypes;
using OMWCSearch.ViewTypes;

namespace OMWebiSearch.Areas.ViewModels
{
    public class SearchResultsViewModel
    {
        public int SearchContextID { get; set; }

        public int PageNumber { get; set; }

        public int TotalSearchHits { get; set; }
        
        public IEnumerable<OMWSearchHit> SearchHits { get; set; }

        public bool HasPreview { get; set; }
        
        public OMWCGridView GridView { get; set; }

        public int? PageSize { get; set; }

        public int SearchProfileId { get; set; }

        public List<ONTOrder> SortOrder { get; set; }
    }
}