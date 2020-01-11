    using System;

namespace OMWSTypes
{
    internal static class DateTimeExtensions
    {
        public static DateTime Epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        

        public static double MillisecondsSinceEpoch(this DateTime self)
        //public static DateTime MillisecondsSinceEpoch(this DateTime self)
        {
            return (self - Epoch).TotalMilliseconds;
        }
    }
}
