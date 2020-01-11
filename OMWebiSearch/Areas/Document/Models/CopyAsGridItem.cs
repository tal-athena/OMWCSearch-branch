using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OMWebiSearch.Areas.Document.Models
{
    public class CopyAsGridItem
    {
        public string iconID; // first column
        public string Template; // second column
        public string DirectoryPath; // third column
        public CopyAsData data; // sent back after the user makes selection
    }
}