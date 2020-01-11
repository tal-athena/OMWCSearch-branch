using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization;
using System.IO;
using System.Xml;
using System.Reflection;

namespace OMWCSearch
{
    #region Accordion navigation control service inteface

    public interface INavigation
    {
        bool GetPanes(out IEnumerable<OMWPaneE> Panes);
        bool GetPaneItems(int PaneID, out IEnumerable<OMWPaneItemE> PaneItems);
        OMWPaneItemE[] GetAllPaneItems();
    }

    #endregion

    #region Accordion navigation control data structures

    [DataContract]
    public partial class OMWPaneE
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public int Type { get; set; }
    }

    [DataContract]
    public partial class OMWPaneItemE
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public int PaneID { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public int Type { get; set; }
        [DataMember]
        public int SearchProfileID { get; set; }
        [DataMember]
        public string Icon { get; set; } /* relative URL to the image of an icon */
    }

    #endregion

    #region Implementation of a dummy navigation panel service

    public class OMSNavigation : OMSBase, INavigation
    {

        public bool GetPanes(out IEnumerable<OMWPaneE> Panes)
        {
            Panes = PanesSerializer.DeSerializePanes();
            return true;
        }

        public OMWPaneItemE[] GetAllPaneItems()
        {
            return PanesSerializer.DeSerializePaneItems().ToArray();
        }

        public bool GetPaneItems(int PaneID, out IEnumerable<OMWPaneItemE> PaneItems)
        {
            var allItems = PanesSerializer.DeSerializePaneItems();

            var items = new List<OMWPaneItemE>();

            int counter = 0;
            foreach (var item in allItems)
            {
                if (item.PaneID == PaneID)
                {
                    if (counter % 3 == 0)
                        item.Icon = "/OMWebiSearch/Content/Images/search-icon-20x20.png";
                    else if (counter % 3 == 1)
                        item.Icon = "/OMWebiSearch/Content/Images/10.png";
                    else if (counter % 3 == 2)
                        item.Icon = "/OMWebiSearch/Content/Images/11.png";
                    items.Add(item);
                    ++counter;
                }
            }

            PaneItems = items;

            return true;
        }
    }

    public class OMSBase
    {
    }

    public class PanesSerializer
    {
        public static IEnumerable<OMWPaneE> DeSerializePanes()
        {
            DataContractSerializer ds = new DataContractSerializer(typeof(IEnumerable<OMWPaneE>));
            Assembly a = Assembly.GetExecutingAssembly();
            using (Stream strm = a.GetManifestResourceStream("OMWCSearch.panes1.xml"))
            //using (var fs = File.Open(path, FileMode.Open))
            {
                var reader = XmlDictionaryReader.CreateTextReader(strm, new XmlDictionaryReaderQuotas());
                return ((IEnumerable<OMWPaneE>)ds.ReadObject(reader, true)).ToList();
            }
        }

        public static IEnumerable<OMWPaneItemE> DeSerializePaneItems()
        {
            DataContractSerializer ds = new DataContractSerializer(typeof(IEnumerable<OMWPaneItemE>));
            Assembly a = Assembly.GetExecutingAssembly();
            using (Stream strm = a.GetManifestResourceStream("OMWCSearch.pane_items1.xml"))
            //using (var fs = File.Open(path, FileMode.Open))
            {
                var reader = XmlDictionaryReader.CreateTextReader(strm, new XmlDictionaryReaderQuotas());
                return ((IEnumerable<OMWPaneItemE>)ds.ReadObject(reader, true)).ToList();
            }
        }
    }
    #endregion
}
