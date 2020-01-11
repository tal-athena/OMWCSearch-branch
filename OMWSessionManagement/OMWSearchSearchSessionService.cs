using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using OMWCSearch.UnitTest;
using OMWSTypes;
using OMWSessionManagement.Interfaces;

namespace OMWSessionManagement
{
    public class OMWSearchSearchSessionService : IOMWSearchSessionService
    {
        private readonly HttpSessionStateBase _sessionState;

        public OMWSearchSearchSessionService(HttpSessionStateBase sessionState)
        {
            _sessionState = sessionState;
        }

        public void CacheSearchHits(int searchContextID, ICollection<OMWSearchHit> searchHits)
        {
            var objectToCache = new CachedSearchResults
                                    {
                                        SearchContextID = searchContextID,
                                        SearchHits = searchHits.ToList()
                                    };
            CacheHits(objectToCache);
        }

        public IEnumerable<OMWSearchHit> GetCachedSearchHits(int searchContextID)
        {
            var cached = (from t in GetAllCachedSearchHits() where t.SearchContextID == searchContextID select t).FirstOrDefault();
            return cached == null ? new List<OMWSearchHit>() : cached.SearchHits;
        }

        public OMWSearchHit FindSearchHit(int searchContextID, string searchHitId)
        {
            var hits = GetCachedSearchHits(searchContextID);
            return (from t in hits where t.ID.GetEncoded() == searchHitId select t).FirstOrDefault();
        }

        private void CacheHits(CachedSearchResults cachedSearchResults)
        {
            var cache = (from t in GetAllCachedSearchHits() where t.SearchContextID != cachedSearchResults.SearchContextID select t).ToList();
            cache.Add(cachedSearchResults);
            SetCache(cache);
        }

        private void SetCache(List<CachedSearchResults> cache)
        {
            _sessionState["CachedSearchHits"] = cache;
        }

        private IEnumerable<CachedSearchResults> GetAllCachedSearchHits()
        {
            if (_sessionState["CachedSearchHits"] == null)
            {
                return new List<CachedSearchResults>();
            }
            return (IEnumerable<CachedSearchResults>) _sessionState["CachedSearchHits"];
        }

    }

    internal class CachedSearchResults
    {
        public int SearchContextID { get; set; }
        public List<OMWSearchHit> SearchHits { get; set; }
    }
}
