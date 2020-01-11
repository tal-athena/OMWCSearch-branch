using System.Collections.Generic;
using OMWCSearch;

namespace OMWebiSearch.Areas.ViewModels
{
    public class PageViewModelBase
    {
        public IList<OMWPaneE> NavigationPanes;

        public int? NavigationPaneNumber { get; set; }

        public int? NavigationPaneId { get; set; }
        public int? NavigationPaneItemId { get; set; }
    }
}