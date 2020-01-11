using System.Collections.Generic;
using OMWSTypes;

namespace OMWCSearch.Interfaces
{
    using OMWCSearch.Enums;

    public interface ISearchService
    {
        ErrorCode SearchStart(
            int searchProfileID, 
            SearchResultsType resultType,  
            IEnumerable<OMWSearchParam> searchParams, 
            out int searchContextID);

        /// <summary>
        /// // NEW API
        /// </summary>
        /// <param name="searchProfileID"></param>
        /// <param name="resultType"></param>
        /// <param name="notificationSink"></param>
        /// <param name="searchParams"></param>
        /// <param name="searchContextID"></param>
        /// <returns></returns>
        ErrorCode SearchStartWithFWSNotifications( 
            int searchProfileID,
            SearchResultsType resultType,
            INTWSearchNotificationSink notificationSink, 
            IEnumerable<OMWSearchParam> searchParams,
            out int searchContextID);

        ErrorCode SearchGetNextHits(int searchContextID, out IEnumerable<OMWSearchHit> hits);
        int GetTotalSearchHits(int searchContextId);
        SearchResultsType GetSearchResultType(int searchContextId);
    }

    public interface INTWSearchNotificationSink
    {
        bool OnFWSHits(IEnumerable<OMWSearchHit> hits);
        bool OnStatus(ONTSearchStatusNotification status);
    }

    public class ONTSearchStatusNotification
    {
        public string Information;
    }


    /// <summary>
    /// Stub
    /// </summary>
    public class ErrorCode
    {
    }
}