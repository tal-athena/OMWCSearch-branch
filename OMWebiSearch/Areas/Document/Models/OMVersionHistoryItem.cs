using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OMWebiSearch.Areas.Document.Models
{
    public class OMVersionHistoryItem
    {
        public string Description { get; set; } 
        public string Date { get; set; } 
        public string Author { get; set; } 
        public string versionID { get; set; }
    }
}