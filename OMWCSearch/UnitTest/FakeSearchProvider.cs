using System;
using System.Collections.Generic;
using System.Linq;
using OMWCSearch.Interfaces;

namespace OMWCSearch.UnitTest
{
    using ViewTypes;

    public class FakeSearchProvider : ISearchProvider
    {
        private static Dictionary<int, OMWCGridView> _contextGridView = new Dictionary<int, OMWCGridView>();

        public IEnumerable<DCOMWSearchProfile> GetAllSearchProfiles()
        {
            return SearchProfilesDeserializer.DeserializeFromFile();
        }

        public DCOMWSearchProfile GetSearchProfileByID(int id)
        {
            return (from t in GetAllSearchProfiles() where t.ID == id select t).FirstOrDefault();
        }

        public OMWCGridView GetGridView(int searchProfileID)
        {
            if (!_contextGridView.ContainsKey(searchProfileID))
            {
                _contextGridView[searchProfileID] = CreateGridView();
            }
            //Add 401 Field for testing
            //_contextGridView[searchProfileID].columns.Add(
            //           new OMWCGridColumn
            //           {
            //               columnName = String.Format("Column {0}", 401),
            //               columnWidth = "50",
            //               FieldID = 401,
            //           }
            //       );

            return _contextGridView[searchProfileID];
        }

        private static OMWCGridView CreateGridView()
        {
            var fields = SearchService.GetFakeFields();
            var rnd = new System.Random();
            var result = new OMWCGridView() { columns = new List<OMWCGridColumn>(), previewLines = 3, fontFamily = "Arial", fontSize = "12px"};

            // 2, 8, 10, 11, 4
            foreach (var field in fields)
            {
                //if (rnd.Next(2) % 2 == 0 && field.FieldID != 15)
                if (field.FieldID == 15
                    || field.FieldID == 4
                    )
                {
                    result.columns.Add(
                        new OMWCGridColumn
                        {
                            columnName = String.Format("Column {0}", field.FieldID),
                            columnWidth = rnd.Next(300).ToString(),
                            FieldID = field.FieldID,
                            alignment = OMWSTypes.EAlignment.Left,
                            customColor = false
                        }
                    );
                }
                else if (field.FieldID == 2
                    || field.FieldID == 8)
                {
                    result.columns.Add(
                       new OMWCGridColumn
                       {
                           columnName = String.Format("Column {0}", field.FieldID),
                           columnWidth = rnd.Next(300).ToString(),
                           FieldID = field.FieldID,
                           alignment = OMWSTypes.EAlignment.Center,
                           customColor = true
                       }
                   );
                }
                else if (field.FieldID == 10
                    || field.FieldID == 11
                    )
                {
                    result.columns.Add(
                      new OMWCGridColumn
                      {
                          columnName = String.Format("Column {0}", field.FieldID),
                          columnWidth = rnd.Next(300).ToString(),
                          FieldID = field.FieldID,
                          alignment = OMWSTypes.EAlignment.Right,
                          customColor = true
                      }
                  );
                }
            }

            return result;
        }
    }
}