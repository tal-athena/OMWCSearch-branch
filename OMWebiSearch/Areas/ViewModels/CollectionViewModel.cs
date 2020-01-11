using System;

namespace OMWebiSearch.Areas.ViewModels
{
    public class CollectionViewModel : PageViewModelBase
    {
        public string CollectionId { get; set; }
        public string TemplateId { get; set; }

        public bool IsNewInEnabled { get; set; }
    }
}