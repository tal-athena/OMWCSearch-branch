using System;

namespace OMWebiSearch.Areas.ViewModels
{
    public class SearchNavigationViewModel
    {
        private const int PageLinksToShow = 10;

        public int PageNumber { get; set; }
        
        public int PageCount { get; set; }

        public int Min
        {
            get { return Math.Min(Math.Max(0, PageNumber - (PageLinksToShow / 2)), Math.Max(0, PageCount - PageLinksToShow + 1)); }
        }

        public int Max
        {
            get { return Math.Min(PageCount, Min + PageLinksToShow); }
        }
    }
}