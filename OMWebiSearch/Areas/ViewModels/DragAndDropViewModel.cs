using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OMWebiSearch.Areas.ViewModels
{
    public class DragAndDropViewModel
    {
        public string sourceCollectionId { get; set; }
        public int sourceRecordId { get; set; }
        public int sourceLevel { get; set; }
        public int sourceTemplateId { get; set; }
        public string sourceObjectId { get; set; }

        public string targetCollectionId { get; set; }
        public int targetRecordId { get; set; }
        public int targetLevel { get; set; }
        public int targetTemplateId { get; set; }
        public string targetObjectId { get; set; }

        public int response { get; set; }
        public bool ctrlPressed { get; set; }
    }
}