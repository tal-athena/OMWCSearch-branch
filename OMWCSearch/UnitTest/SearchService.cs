using System;
using System.Collections.Generic;
using System.Linq;
using OMWCSearch.Interfaces;
using OMWCSearch.Enums;
using OMWSTypes;

namespace OMWCSearch.UnitTest
{
    public partial class SearchService : ISearchService
    {

        private static int _searchHitID = 1;
        private static int SearchHitPendingID
        {
            get { return _searchHitID++; }
        }

        private static readonly Dictionary<int, int> SearchHitsCounts = new Dictionary<int, int>();
        private static readonly Dictionary<int, int> SearchHitsFetched = new Dictionary<int, int>();
        private static readonly Dictionary<int, SearchResultsType> SearchResultTypes = new Dictionary<int, SearchResultsType>();

        private static readonly Random Random = new Random((int)DateTime.Now.Ticks);

        private const string MainString =
            "By Lionel Perron TORONTO, Sept 11 (Reuters)<br/> - Almost four years on from Terrell  Owens's brief and troubled stint<br/> in Philadelphia, the city's NFL team, the Eagles,  are p<br/><br/><br/>utting their faith in another controversial player:<br/> convicted felon Michael  Vick.<br/> The club has been lambasted by animal welfare advocates for signing the quarterback  who has spent the bulk of the past<br/><br/> two years behind bars for his role in<br/><br/> a dog-fighting  operation. Immediately after Vick's<br/><br/><br/> signing, some angry Eagles<br/> fans said they would<br/>  hand back their season tickets and give up their team<br/> jerseys. The team has responded  by getting involved in the cause of animal welfare. \"All of us have put ourselves  on the line and will be subject to legitimate questions and scepticism and doubt  if we end up being wrong, which is why we researched this so thoroughly and feel  like we made a very educated decision and took a risk,\" team president Joe Banner  told the media when he announced Vick's<br/><br/> signing. Vick was once one of the NFL's  most popular and exciting players but he was jailed in 2007 for bankrolling a dog-fighting  ring after police raided his country property in Virginia. His fall from grace cost  him an estimated $100 million in lost salary and endorsements and his old club,  the Atlanta Falcons, relinquished their rights to his contract after he was released  from prison in May. The Eagles signed him last month, with coach Andy Reid saying  the player deserved a second chance. ANIMAL RIGHTS Reid and the club have experience  of dealing with headline-making players. The flamboyant Owens, a hugely talented  wide receiver, helped the Eagles to reach the Super Bowl in 2005<br/><br/> but quickly wore  out his welcome in Philadelphia by demanding that his contract be renegotiated one  season into his seven-year, $48-million deal. Owens feuded with the team owners  and tested<br/><br/> the patience of Reid and his team mates, repeatedly criticising quarterback  Donovan McNabb. His two-year stint with the team ended in 2005 after just seven  games<br/><br/><br/> when he was suspended and later deactivated for conduct detrimental to the  team after attacks on the management and McNabb. The Eagles are facing up to controversy  this time by submitting proposals to several animal rights groups on how to combat  animal abuse, according to the Philadelphia Inquirer newspaper. Vick and Wayne Pacelle,  CEO of the Humane Society of the United States, visited a local school together  on Tuesday to offer Vick's fall from grace as a cautionary tale. On the football  field, it is still unclear what role the running-passing quarterback will play when  he is fully reinstated in week three of the league's regular season, when the Eagles  host Kansas City Chiefs on Sept. 27. Critics question whether the 29-year-old Vick,  a three-time Pro Bowler, has anything left after missing the last two seasons.<br/><br/><br/><br/> In  two pre-season games, Vick completed 11 of 15 passes for 45 yards, with one interception  and rushed for 36 yards on eight carries with one touchdown. INSURANCE POLICY In  a league where wildcat offensive formation is gaining popularity, ESPN analyst and  former Indianapolis Colts coach Tony Dungy, who has been mentoring Vick through  his attempt to return to the NFL, says: \"You have to substitute him in certain situations  during the football game. \"When you have that many guys who can touch the football  to make big plays, if you are a defensive coordinator right now getting ready to  play the Philadelphia Eagles, you got a headache.\" While Vick awaits his full reinstatement,  the spotlight will also fall on long-time quarterback McNabb. Despite coming off  a career high of 3,916 passing yards, he will feel some pressure from the high-profile  presence of a former starting quarterback. McNabb will want to squash any suggestions  of Vick being an eventual replacement when he leads the Eagles on Sunday against  the Carolina Panthers. In a sport where injuries are ubiquitous, Vick's one-year  deal at $1.6 million (with a second-year option at $5.2 million) represents a relatively  cheap insurance policy in case McNabb is hurt. One of this year's most anticipated  games will take place in week 13 when Vick returns to Atlanta to face the Falcons.  (Editing by Clare Fallon; To query or comment on this story email sportsfeedback@thomsonreuters.com)  REUTERS 110147 Sep 09";

	    private const string PreviewMainMark = @"<div id='searchResultGridDetailView' style='min-height: 553px; display: block;'>
<meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
<meta name='Generator' content='Microsoft Exchange Server'>
<!-- converted from rtf -->
<style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style>


<font face='Courier New' size='2'><span style='font-size:10pt;'>
<div>Frankfurt/main (dpa)                   </div>
<div>Frankfurt/Main    (dpa)           -            An         der          <b><i><u>Frankfurter</u></i></b>  Wertpapierbörse  </div>
<div>wurden            am              12.04.2017   <b><i><u>um</u></i></b>         <b><i><u>14:05</u></i></b>        Uhr          folgende         Kurse   für  18  <b><i><u>ausgewählte</u></i></b>  </div>
<div>Auslandswerte     festgestellt.   (Stand       und        Veränderung  zur          </div>
<div>Schlussnotierung  am              vorherigen   Börsentag  bei          Aktien       in               Euro).  </div>
<div>Aktie             Kurs            Veränderung  </div>
<div>Altria            Group           68,20        (+         0,34)        </div>
<div>Apple             133,55          (-           0,37)      </div>
<div>Banco             5,66            (+           0,01)      </div>
<div>Santander         </div>
<div>BP                Amoco           5,59         (+         0,06)        </div>
<div>Coca-Cola         40,30           (+           0,09)      </div>
<div>DuPont            47,80           (-           0,01)      </div>
<div>Ericsson          6,10            (+           0,08)      </div>
<div>ExxonMobil        78,20           (+           0,44)      </div>
<div>Ford              10,65           (+           0,03)      </div>
<div>General           Motors          32,04        (+         0,08)        </div>
<div>IBM               161,07          (+           0,17)      </div>
<div>McDonald's        123,94          (+           0,63)      </div>
<div>Microsoft         61,75           (+           0,28)      </div>
<div>Nissan            Motors          8,60         (-         0,24)        </div>
<div>Nokia             4,98            (+           0,05)      </div>
<div>Sony              29,46           (-           0,55)      </div>
<div>UBS               14,56           (-           0,21)      </div>
<div>Vodafone          2,43            (-           0,02)      </div>
<div>Quelle:           Reuters/oraise  </div>
<div>Stand:            12.04.2017      <b><i><u>14:05</u></i></b>        Uhr        </div>
<div>dpa               yyzz            s5           akn        </div>
<div></div>
<div>(DPA) - erd290</div>
<div></div>
<div>12.04.2017 14:10 Uhr</div>
<div></div>
</span></font>";

        public static readonly List<OMWSearchHit> TemplateSearchHits = new List<OMWSearchHit>
                                                                            {
                                                                                new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[8].ID,
                                                                                        DocumentType = OMWCDocumentType.Story,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "Preview main mark",
                                                                                        PreviewMain = PreviewMainMark
                                                                                        , ItemRead = true
                                                                                    },
                                                                                new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[0].ID,
                                                                                        DocumentType = OMWCDocumentType.Story,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "FEATURE-NFL-Eagles put their faith in controversial Vick",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))
                                                                                        , ItemRead = true,
                                                                                        ItemStatus = "recycled"
                                                                                    },
                                                                                new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[1].ID,
                                                                                        DocumentType = OMWCDocumentType.Story,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "UPDATE 3-Bad weather delays shuttle landing to Friday",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))
                                                                                      
                                                                                        , ItemRead = true,
                                                                                        ItemStatus = "flaged"
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[2].ID,
                                                                                        DocumentType = OMWCDocumentType.Story,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "Mini-robes et mousselines arc-en-ciel ouvrent la \"Fashion Week\" a New York (REPORTAGE)",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))
                                                                                       
                                                                                        , ItemRead = true,
                                                                                        ItemStatus = "recycled"
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[3].ID,
                                                                                        DocumentType = OMWCDocumentType.Story,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "Deutschlandfunk - Das war der Tag - 23.10 - 23.57 Uhr - RUCKSCHAU - Donnerstag, 10. September 2009",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = true,
                                                                                        ItemStatus = "flaged"
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[4].ID,
                                                                                        DocumentType = OMWCDocumentType.Story,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "Le sud-est de la France sous des trombes d'eau pour le troisieme jour (PHOTO)",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = true,
                                                                                        ItemStatus = "recycled"
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[5].ID,
                                                                                        DocumentType = OMWCDocumentType.Story,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "A l'attention des redactions (ADDITIF)",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = true
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[6].ID,
                                                                                        DocumentType = OMWCDocumentType.Story,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "La Croix-Rouge distribue aux refugies de Houston des cartes de paiement",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = false,
                                                                                        ItemStatus = "archived"
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[7].ID,
                                                                                        DocumentType = OMWCDocumentType.Story,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "Policiers et industries s'opposent sur le stockage des donnees telephoniques (PAPIERGENERAL) Par Fabrice RANDOUX",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = false,
                                                                                        ItemStatus = "flaged"
                                                                                    }
                                                                            };
        public static readonly List<OMWSearchHit> TemplateSearchCollectionHits = new List<OMWSearchHit>
                                                                            {
                                                                                new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[0].ID,
                                                                                        DocumentType = OMWCDocumentType.Collection,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "FEATURE-NFL-Eagles put their faith in controversial Vick",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = false,
                                                                                        ItemStatus = "recycled"
                                                                                    },
                                                                                new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[1].ID,
                                                                                        DocumentType = OMWCDocumentType.Collection,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "UPDATE 3-Bad weather delays shuttle landing to Friday",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = false,
                                                                                        ItemStatus = "archived"
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[2].ID,
                                                                                        DocumentType = OMWCDocumentType.Collection,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "Mini-robes et mousselines arc-en-ciel ouvrent la \"Fashion Week\" a New York (REPORTAGE)",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = false,
                                                                                        ItemStatus = "flaged"
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[3].ID,
                                                                                        DocumentType = OMWCDocumentType.Collection,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "Deutschlandfunk - Das war der Tag - 23.10 - 23.57 Uhr - RUCKSCHAU - Donnerstag, 10. September 2009",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = true,
                                                                                        ItemStatus = "recycled"
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[4].ID,
                                                                                        DocumentType = OMWCDocumentType.Collection,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "Le sud-est de la France sous des trombes d'eau pour le troisieme jour (PHOTO)",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = true,
                                                                                        ItemStatus = "archived"
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[5].ID,
                                                                                        DocumentType = OMWCDocumentType.Collection,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "A l'attention des redactions (ADDITIF)",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = true
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[6].ID,
                                                                                        DocumentType = OMWCDocumentType.Collection,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "La Croix-Rouge distribue aux refugies de Houston des cartes de paiement",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = false
                                                                                    },
                                                                                    new OMWSearchHit
                                                                                    {
                                                                                        ID = FakeDataAccess.GetStoryList()[7].ID,
                                                                                        DocumentType = OMWCDocumentType.Collection,
                                                                                        Fields = GetFakeFields(),
                                                                                        PreviewHeader =
                                                                                            "Policiers et industries s'opposent sur le stockage des donnees telephoniques (PAPIERGENERAL) Par Fabrice RANDOUX",
                                                                                        PreviewMain = MainString.Substring(100, Random.Next(MainString.Length-101))

                                                                                        , ItemRead = true,
                                                                                        ItemStatus = "archived"
                                                                                    }
                                                                            };


        public static OMWField[] GetFakeFields(bool IsForFWSUpdate = false)
        {
            var rand = new Random((int)DateTime.Now.Ticks);
            return new OMWField[]
            {
                new OMWField
                {
	                EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
					FieldID = 2,
                    FieldValue = new OMWValueString("value1;value2;value3")
					{ BackgroundColor = "#fff" }
				},
	            new OMWField
	            {
		            EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_Combo,
		            FieldID = 20,
		            FieldValue = new OMWValueString("value1")
		                         { BackgroundColor = "#fff" }
	            },
	            new OMWField
	            {
		            EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_InternalLink,
		            FieldID = 20100,
		            FieldValue = new OMWValueString("some_link")
			            { BackgroundColor = "#fff" },
					
	            },
				new OMWField
                {
                    FieldID = 8,
                    FieldValue = new OMWValueString(IsForFWSUpdate? "UPDATED UPDATED" : "Random string")
                   { BackgroundColor = "#fff" }
                },
	            new OMWField
	            {
		            FieldID = 1000,
		            FieldValue = new OMWValueInt(1){ BackgroundColor = "#aaa"},
		            EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_Check
	            },
				new OMWField
                {
	                FieldID = 1,
					FieldValue = new OMWValueInt(1){ BackgroundColor = "#fff"},
					EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_Check
				},
	            new OMWField
	            {
		            FieldID = 100,
		            FieldValue = new OMWValueInt(1){ BackgroundColor = "#fff"},
		            EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_Check
	            },
				new OMWField
	            {
		            FieldID = 10,
		            FieldValue = new OMWValueDateTime(DateTime.Now.AddDays(-1)){ BackgroundColor = "#fff" },
					EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_DateTime
	            },
	            new OMWField
	            {
		            FieldID = 15,
		            FieldValue = new OMWValueDate(DateTime.Now.AddDays(-2)){ BackgroundColor = "#fff" },
					EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_DateOnly
				},
				new OMWField
                {
                    FieldID = 7,
                    FieldValue = new OMWValueTime(DateTime.Now.AddHours(-5)){ BackgroundColor = "#fff" },
					EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_TimeOnly
				},
                new OMWField
                {
                    FieldID = 66,
                    FieldValue = new OMWValueString(DateTime.Now.ToString("-" + "HH:mm:ss")){ BackgroundColor = "#fff" },
					EditorType = EOMWFieldDisplayType.eOMFieldDisplayType_Duration
				},
	            new OMWField
	            {
		            FieldID = 4,
		            FieldValue = new OMWValueInt(Random.Next()){ BackgroundColor = "#fff" }
				}
			};
        }

        public ErrorCode SearchStart(int searchProfileID, SearchResultsType resultType, IEnumerable<OMWSearchParam> searchParams, out int searchContextID)
        {

            try
            {
                foreach (var omwSearchParam in searchParams)
                {
                    // fake loop added in order to pass throught the enumerator
                }
            }
            catch { }


            var searchID = Random.Next();
            while (SearchHitsCounts.ContainsKey(searchID))
            {
                searchID = Random.Next();
            }

            var count = 35;//Random.Next(35);

            SearchHitsCounts[searchID] = count;
            SearchHitsFetched[searchID] = 0;
            SearchResultTypes[searchID] = resultType;
            searchContextID = searchID;

            return new ErrorCode();
        }

        public ErrorCode SearchGetNextHits(int searchContextID, out IEnumerable<OMWSearchHit> hits)
        {
            if (!SearchHitsCounts.ContainsKey(searchContextID))
            {
                hits = new List<OMWSearchHit>();
                return new ErrorCode();
            }

            const int countToFetch = 10;
            var alreadyFetched = SearchHitsFetched[searchContextID];
            var totalCount = SearchHitsCounts[searchContextID];

            if (alreadyFetched + countToFetch >= totalCount)
            {
                hits = Fetch(totalCount - alreadyFetched);
                SearchHitsFetched[searchContextID] = totalCount;
            }
            else
            {
                hits = Fetch(countToFetch);
                SearchHitsFetched[searchContextID] += countToFetch;
            }

            foreach (var hit in hits)
            {
                //hit.SupportOpen = ((Random.Next(0, 8) % 6) != 0); // Disable 12% 
                hit.SupportOpen = true;
            }
            return new ErrorCode();
        }


        /////////////////////////////////////
        /// Forward Search Test Data
        /////////////////////////////////////

        public static IEnumerable<OMWSearchHit> GetFWSUpdates()
        {
            var lst = new List<OMWSearchHit>();

            //    lst.Add(GetFWSNewInPos1());
            return lst;
        }

        public static OMWSearchHit GetFWSNew()
        {
            var hit = (OMWSearchHit)TemplateSearchHits[1].Clone();
            var lst = hit.Fields.ToList();
            var fld = lst.RemoveAll(x => x.FieldID == 8);
            lst.Add(
                new OMWField
                {
                    FieldID = 8,
                    FieldValue = new OMWValueString("NEW NEW NEW") { BackgroundColor = "#FF0000" }
                });
            hit.Fields = lst.ToArray();
            hit.ReferenceObjectID = TemplateSearchHits[1].ID;
            hit.ID.PinnID = 314159;
            return hit;
        }

        public static OMWSearchHit GetFWSNewInPos1()
        {
            var hit = (OMWSearchHit)TemplateSearchHits[1].Clone();
            var lst = hit.Fields.ToList();
            var fld = lst.RemoveAll(x => x.FieldID == 8);
            lst.Add(
                new OMWField
                {
                    FieldID = 8,
                    FieldValue = new OMWValueString("POS 1 - NEW NEW NEW") { BackgroundColor = "#FF0000" }
                });
            hit.Fields = lst.ToArray();
            hit.ReferenceObjectID = new OMWDocumentID(0, 0, "dummy-sys");
            hit.ID.PinnID = 314151;
            return hit;
        }

        public static OMWSearchHit GetFWSUpdate()
        {
            var hit = (OMWSearchHit)TemplateSearchHits[1].Clone();
            hit.Fields = GetFakeFields(true);
            hit.PreviewHeader = "UPDATED PREVIEW HEADER!!!";
            hit.UpdateExisting = true;
            return hit;
        }

        public static OMWSearchHit GetFWSChangedOrder()
        {
            var hit = (OMWSearchHit)TemplateSearchHits[1].Clone();
            hit.ReferenceObjectID = TemplateSearchHits[3].ID;
            hit.ChangedOrder = true;
            return hit;
        }

        public static OMWSearchHit GetFWSDeleteExisting()
        {
            var hit = (OMWSearchHit)TemplateSearchHits[2].Clone();
            hit.DeleteExisting = true;
            return hit;
        }

        /////////////////////////////////////
        /// End Of Forward Search Test Data
        /////////////////////////////////////

        public int GetTotalSearchHits(int searchContextId)
        {
            return !SearchHitsCounts.ContainsKey(searchContextId) ? 0 : SearchHitsCounts[searchContextId];
        }

        public SearchResultsType GetSearchResultType(int searchContextId)
        {
            return (SearchResultTypes.ContainsKey(searchContextId) ?
                SearchResultTypes[searchContextId] : SearchResultsType.Preview);
        }

        private IEnumerable<OMWSearchHit> Fetch(int count)
        {
            var hitsCount = TemplateSearchHits.Count;
            var collectionCount = TemplateSearchCollectionHits.Count;
            for (var i = 0; i < count; i++)
            {
                var res = (i % 2 == 0 ?
                    TemplateSearchHits[(i / 2) % hitsCount] :
                    TemplateSearchCollectionHits[((i - 1) / 2) % collectionCount]);
                res.ID = (res.DocumentType == OMWCDocumentType.Story ?
                    FakeDataAccess.GetStoryList()[SearchHitPendingID % 34].ID :
                    FakeCollectionsAccess.GetCollectionList()[SearchHitPendingID % 34].ID);

                yield return res;
            }
        }
    }
}