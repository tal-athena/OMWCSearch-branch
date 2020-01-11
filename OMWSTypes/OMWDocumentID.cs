using System;
using System.Runtime.Serialization;
using System.Text;

namespace OMWSTypes
{
    [DataContract(Name = "OMWDocumentID", Namespace = "OMWSTypes")]
    public class OMWDocumentID
    {
        #region Public properties
        [DataMember]
        public int PoolID { get; set; }

        [DataMember]
        public int PinnID { get; set; }

        [DataMember]
        public string SystemID { get; set; }

        [DataMember]
        public string EncodedID
        {
            get { return this.GetEncoded(); }
            set
            {
                var id = FromString(value);
                PoolID = id.PoolID;
                PinnID = id.PinnID;
                SystemID = id.SystemID;
            }
        }
        #endregion


        #region Constructors
        public OMWDocumentID()
        {
            PoolID = 0;
            PinnID = 0;
        }

        public OMWDocumentID(int poolId, int pinnId)
        {
            PoolID = poolId;
            PinnID = pinnId;
        }

        public OMWDocumentID(int poolId, int pinnId, string systemID)
        {
            PoolID = poolId;
            PinnID = pinnId;
            SystemID = systemID;
        }
        #endregion


        #region Public methods
        public override string ToString()
        {
            return String.Format("<{0},{1},{2}>", PoolID, PinnID, SystemID);
        }

        public static OMWDocumentID FromString(string id)
        {
            OMWDocumentID documentId = new OMWDocumentID();
            if (String.IsNullOrEmpty(id))
            {
                return documentId;
            }

            string decodedId = documentId.GetDecoded(id);
            decodedId = decodedId.Replace("<", string.Empty).Replace(">", string.Empty);

            string[] idValues = decodedId.Split(new char[] { ',' });
            if (idValues.Length != 3)
            {
                throw new ArgumentException();
            }

            documentId.PoolID = int.Parse(idValues[0]);
            documentId.PinnID = int.Parse(idValues[1]);
            documentId.SystemID = idValues[2];

            return documentId;
        }

        public override int GetHashCode()
        {
            return this.ToString().GetHashCode();
        }

        public string GetEncoded()
        {
            byte[] toEncodeAsBytes
                  = Encoding.ASCII.GetBytes(this.ToString());
            string returnValue
                  = Convert.ToBase64String(toEncodeAsBytes);
            return returnValue;
        }

        public string GetDecoded(string encodedId)
        {
            byte[] encodedDataAsBytes = Convert.FromBase64String(encodedId);

            string returnValue = Encoding.ASCII.GetString(encodedDataAsBytes);

            return returnValue;
        }
        #endregion
    }

}
