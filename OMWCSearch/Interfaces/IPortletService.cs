using System;
using System.Collections.Generic;

namespace OMWCSearch.Interfaces
{
    public class SearchParameter
    {
        public string Label { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
    }

    public class Portlet
    {
        public Portlet()
        {
            Guid = System.Guid.NewGuid().ToString("N");
        }

        public string Guid { get; set; }
        public int CategoryId { get; set; }
        public int ProfileId { get; set; }
        public SearchParameter[] Parameters { get; set; }
    }

    public interface IPortletService
    {
        void AddPortlet(Portlet portlet);
        void RemovePortlet(Portlet portlet);

        Portlet[] GetPortlets(int categoryId);
        int[] GetPortletCategoryIds();
    }
}
