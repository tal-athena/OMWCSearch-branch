using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OMWebiSearch.Areas.ViewModels
{
    public class ToolbarViewModel
    {
        public List<OMWCSearch.Interfaces.ViewSelectData> viewSelectData { get; set; }
        public List<OMWCSearch.Interfaces.ToolBarButton> ToolbarItems { get; set; }
        public bool IsNewInEnabled { get; set; }
        public bool StoryReadonly { get; set; }
    }

}