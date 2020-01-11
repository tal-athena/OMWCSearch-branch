using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OMWCSearch.Interfaces
{
    public interface ISelectionLists
    {
      
        // Data for the document type selection list
        IEnumerable<OMWSelectionListItem> GetNewItemList(string Id);
        // Data for the parent selection list
        IEnumerable<OMWSelectionListItem> GetNewParentListForDocType(string DocTypeID);
        // Called when the user clicks OK
        string CreateNewDocument(string DocTypeID, string ParentDocID);
    }

    public class OMWSelectionListItem
    {
        public string Name { get; set; }
        public string Directory { get; set; } // Directotry is empty for parent document lists
        public string IconURL { get; set; }
        public string ID { get; set; } // The ID is not shown in the dialog
    }

    public class ISelectionListsDummyImpl : ISelectionLists
    {
        public IEnumerable<OMWSelectionListItem> GetNewItemList(string Id)
        {
            //Use ID to set what is the function returning
            if (!String.IsNullOrEmpty(Id))
            {
                var lst = new List<OMWSelectionListItem>();
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Story-Type-A",
                    Directory = "Stories\\Types\\A",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon1.png",
                    ID = "NEWDOCID1"
                });
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Story-Type-B",
                    Directory = "Stories\\Types\\B",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon2.png",
                    ID = "NEWDOCID2"
                });
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Story-Type-C",
                    Directory = "Stories\\Types\\C",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon3.png",
                    ID = "NEWDOCID3"
                });
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Collection-Type-A",
                    Directory = "Collections\\Types\\A",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon4.png",
                    ID = "NEWDOCID4"
                });
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Collection-Type-B",
                    Directory = "Collections\\Types\\B",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon4.png",
                    ID = "NEWDOCID5"
                });
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Collection-Type-C",
                    Directory = "Collections\\Types\\C",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon4.png",
                    ID = "NEWDOCID6"
                });
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Collection-Type-D",
                    Directory = "Collections\\Types\\A",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon4.png",
                    ID = "NEWDOCID77"
                });

                return lst.AsEnumerable();
            }
            else
            {
                var lst = new List<OMWSelectionListItem>();
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Story-Type-A",
                    Directory = "Stories\\Types\\A",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon1.png",
                    ID = "NEWDOCID1"
                });
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Story-Type-B",
                    Directory = "Stories\\Types\\B",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon2.png",
                    ID = "NEWDOCID2"
                });
                lst.Add(new OMWSelectionListItem()
                {
                    Name = "Story-Type-C",
                    Directory = "Stories\\Types\\C",
                    IconURL = "\\Content\\RecordIcons\\RecordIcon3.png",
                    ID = "NEWDOCID3"
                });
        
                return lst.AsEnumerable();
            }

           
        }


        public IEnumerable<OMWSelectionListItem> GetNewParentListForDocType(string DocTypeID)
        {
            var lst = new List<OMWSelectionListItem>();
            lst.Add(new OMWSelectionListItem()
            {
                Name = "Parent-Type-A",
                Directory = string.Empty,
                IconURL = "\\Content\\RecordIcons\\RecordIcon1.png",
                ID = "ParentDOCID1"
            });
            lst.Add(new OMWSelectionListItem()
            {
                Name = "Parent-Type-B",
                Directory = string.Empty,
                IconURL = "\\Content\\RecordIcons\\RecordIcon2.png",
                ID = "ParentDOCID2"
            });
            lst.Add(new OMWSelectionListItem()
            {
                Name = "Parent-Type-C",
                Directory = string.Empty,
                IconURL = "\\Content\\RecordIcons\\RecordIcon3.png",
                ID = "ParentDOCID3"
            });
            lst.Add(new OMWSelectionListItem()
            {
                Name = "Parent-Type-D",
                Directory = string.Empty,
                IconURL = "\\Content\\RecordIcons\\RecordIcon4.png",
                ID = "ParentDOCID4"
            });

            return lst.AsEnumerable();
        }

        public string CreateNewDocument(string DocTypeID, string ParentDocID)
        {
            return "http://localhost/OMWebiSearch/Story/EditStory/Index/PDIsMjM2ODMsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==";
        }


        public string CreateNewDocument(string DocTypeID)
        {
            return "http://localhost/OMWebiSearch/Story/EditStory/Index/PDIsMjM2ODMsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==";
        }

        private bool swapFlag { get; set; }
    }
}
