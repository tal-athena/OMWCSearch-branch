using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OMWCSearch.Interfaces
{
    public interface IPortletRepository
    {
        void AddOrUpdate(Portlet portlet);
        void RemovePortlet(Portlet portlet);

        Portlet[] GetPortlets(int categoryId);
        int[] GetPortletCategoryIds();
    }
}
