using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OMWSTypes
{
    public static class DateTimeCSJSConvert
    {
        public static string CSToJS(string dateFormat)
        {
            string newFormat = dateFormat;

            if (dateFormat != null)
            {
                int noOfY = newFormat.Count(p => p == 'y');
                int position = newFormat.IndexOf('y');
                if (noOfY == 2)
                {
                    newFormat = newFormat.Remove(position, 1);
                }
                else if (noOfY == 4)
                {
                    newFormat = newFormat.Remove(position, 2);
                }
                if (newFormat.Contains(' '))//Then it is a date time
                {
                    var date = newFormat.Split(' ');
                    if (date[0].Contains("MMMM"))
                    {
                        date[0] = date[0].Replace("MMMM", "MM");
                    }
                    else if (date[0].Contains("MMM"))
                    {
                        date[0] = date[0].Replace("MMM", "M");
                    }
                    else if (date[0].Contains("MM"))
                    {
                        date[0] = date[0].Replace("MM", "mm");
                    }
                    else
                    {
                        date[0] = date[0].Replace("M", "m");
                    }

                    newFormat = date[0] + " " + date[1];
                }
                else if (newFormat.Contains('s') == false)
                {
                    if (newFormat.Contains("MMMM"))
                    {
                        newFormat = newFormat.Replace("MMMM", "MM");
                    }
                    else if (newFormat.Contains("MMM"))
                    {
                        newFormat = newFormat.Replace("MMM", "M");
                    }
                    else if (newFormat.Contains("MM"))
                    {
                        newFormat = newFormat.Replace("MM", "mm");
                    }
                    else
                    {
                        newFormat = newFormat.Replace("M", "m");
                    }

                }
            }

            return newFormat;
        }

        //MM has to be changed too
        //in Jqeury mm is the MM in the C#

        public static string JSToCS(string dateFormat)
        {
            string newFormat = dateFormat;
            if (dateFormat != null)
            {
                int noOfY = newFormat.Count(p => p == 'y');
                int position = newFormat.IndexOf('y');
                //Add one y
                if (noOfY == 1)
                {
                    newFormat = newFormat.Insert(position, "y");
                }
                //Add two yy
                else if (noOfY == 2)
                {
                    newFormat = newFormat.Insert(position, "yy");
                }

                if (newFormat.Contains(' '))//Then it is a date time
                {
                    var date = newFormat.Split(' ');
                    if (date[0].Contains("MM"))
                    {
                        date[0] = date[0].Replace("MM", "MMMM");
                    }
                    else if (date[0].Contains("M"))
                    {
                        date[0] = date[0].Replace("M", "MMM");
                    }
                    else if (date[0].Contains("mm"))
                    {
                        date[0] = date[0].Replace("mm", "MM");
                    }
                    else
                    {
                        date[0] = date[0].Replace("m", "M");
                    }

                    newFormat = date[0] + " " + date[1];
                }
                else if (newFormat.Contains('s') == false)
                {
                    if (newFormat.Contains("MM"))
                    {
                        newFormat = newFormat.Replace("MM", "MMMM");
                    }
                    else if (newFormat.Contains("M"))
                    {
                        newFormat = newFormat.Replace("M", "MMM");
                    }
                    else if (newFormat.Contains("mm"))
                    {
                        newFormat = newFormat.Replace("mm", "MM");
                    }
                    else
                    {
                        newFormat = newFormat.Replace("m", "M");
                    }

                }

            }
            return newFormat;
        }




        //Mobile

        public static string CSToJSMobile(string dateFormat)
        {
            string newFormat = dateFormat;

            if (dateFormat != null)
            {
                int noOfY = newFormat.Count(p => p == 'y');
                int position = newFormat.IndexOf('y');
                if (noOfY == 2)
                {
                    newFormat = newFormat.Replace("yy", "%y");
                }
                else if (noOfY == 4)
                {
                    newFormat = newFormat.Replace("yyyy", "%Y");
                }


                if (newFormat.Contains("MMMM"))
                {
                    newFormat = newFormat.Replace("MMMM", "%B");
                }
                else if (newFormat.Contains("MMM"))
                {
                    newFormat = newFormat.Replace("MMM", "%b");
                }
                else if (newFormat.Contains("MM"))
                {
                    newFormat = newFormat.Replace("MM", "%m");
                }
                else if (newFormat.Contains("M"))
                {
                    newFormat = newFormat.Replace("M", "%m");
                }

                if (newFormat.Contains("dddd"))
                {
                    newFormat = newFormat.Replace("dddd", "%A");
                }
                else if (newFormat.Contains("ddd"))
                {
                    newFormat = newFormat.Replace("ddd", "%a");
                }
                else if (newFormat.Contains("dd"))
                {
                    newFormat = newFormat.Replace("dd", "%d");
                }
                else if (newFormat.Contains("d"))
                {
                    newFormat = newFormat.Replace("d", "%d");
                }


                //Hour
                if (newFormat.Contains("hh"))
                {
                    newFormat = newFormat.Replace("hh", "%I");
                }
                else if (newFormat.Contains("h"))
                {
                    newFormat = newFormat.Replace("h", "%I");
                }
                else if (newFormat.Contains("HH"))
                {
                    newFormat = newFormat.Replace("HH", "%H");
                }
                else if (newFormat.Contains("H"))
                {
                    newFormat = newFormat.Replace("H", "%H");
                }


                //Minute
                if (newFormat.Contains("mm"))
                {
                    newFormat = newFormat.Replace("mm", "%M");
                }
                else if (newFormat.Contains("m"))
                {
                    newFormat = newFormat.Replace("m", "%M");
                }



                //Second
                if (newFormat.Contains("ss"))
                {
                    newFormat = newFormat.Replace("ss", "%S");
                }
                else if (newFormat.Contains("s"))
                {
                    newFormat = newFormat.Replace("s", "%S");
                }


                //AM/PM
                if (newFormat.Contains("tt"))
                {
                    newFormat = newFormat.Replace("tt", "%p");
                }
                else if (newFormat.Contains("t"))
                {
                    newFormat = newFormat.Replace("t", "%p");
                }



            }
            else
            {
                newFormat = "%d/%m%Y %H:%M:%S";
            }
            return newFormat;
        }

        public static string CSToJSDateMobile(string dateFormat)
        {
            string newFormat = dateFormat;

            if (dateFormat != null)
            {
                newFormat = dateFormat.Split(' ')[0];

                if (newFormat.Contains("yyyy"))
                {
                    newFormat = newFormat.Replace("yyyy", "%Y");
                }
                else if (newFormat.Contains("yyy"))
                {
                    newFormat = newFormat.Replace("yyy", "%Y");
                }
                else if (newFormat.Contains("yy"))
                {
                    newFormat = newFormat.Replace("yy", "%y");
                }
                else if (newFormat.Contains("y"))
                {
                    newFormat = newFormat.Replace("y", "%y");
                }

                if (newFormat.Contains("MMMM"))
                {
                    newFormat = newFormat.Replace("MMMM", "%B");
                }
                else if (newFormat.Contains("MMM"))
                {
                    newFormat = newFormat.Replace("MMM", "%b");
                }
                else if (newFormat.Contains("MM"))
                {
                    newFormat = newFormat.Replace("MM", "%m");
                }
                else if (newFormat.Contains("M"))
                {
                    newFormat = newFormat.Replace("M", "%m");
                }

                if (newFormat.Contains("dddd"))
                {
                    newFormat = newFormat.Replace("dddd", "%A");
                }
                else if (newFormat.Contains("ddd"))
                {
                    newFormat = newFormat.Replace("ddd", "%a");
                }
                else if (newFormat.Contains("dd"))
                {
                    newFormat = newFormat.Replace("dd", "%d");
                }
                else if (newFormat.Contains("d"))
                {
                    newFormat = newFormat.Replace("d", "%d");
                }

            }
            else
            {
                newFormat = "%d/%m/%Y";
            }
            return newFormat;
        }

        public static string CSToJSTimeMobile(string dateFormat)
        {
            string newFormat = dateFormat;

            if (dateFormat != null)
            {

                //Hour
                if (newFormat.Contains("hh"))
                {
                    newFormat = newFormat.Substring(newFormat.IndexOf('h'));
                    newFormat = newFormat.Replace("hh", "%I");
                }
                else if (newFormat.Contains("h"))
                {
                    newFormat = newFormat.Substring(newFormat.IndexOf('h'));
                    newFormat = newFormat.Replace("h", "%I");
                }
                else if (newFormat.Contains("HH"))
                {
                    newFormat = newFormat.Substring(newFormat.IndexOf('H'));
                    newFormat = newFormat.Replace("HH", "%H");
                }
                else if (newFormat.Contains("H"))
                {
                    newFormat = newFormat.Substring(newFormat.IndexOf('H'));
                    newFormat = newFormat.Replace("H", "%H");
                }


                //Minute
                if (newFormat.Contains("mm"))
                {
                    newFormat = newFormat.Replace("mm", "%M");
                }
                else if (newFormat.Contains("m"))
                {
                    newFormat = newFormat.Replace("m", "%M");
                }



                //Second
                if (newFormat.Contains("ss"))
                {
                    newFormat = newFormat.Replace("ss", "%S");
                }
                else if (newFormat.Contains("s"))
                {
                    newFormat = newFormat.Replace("s", "%S");
                }


                //AM/PM
                if (newFormat.Contains("tt"))
                {
                    newFormat = newFormat.Replace("tt", "%p");
                }
                else if (newFormat.Contains("t"))
                {
                    newFormat = newFormat.Replace("t", "%p");
                }



            }
            else
            {
                newFormat = "%H:%M:%S";
            }

            return newFormat;
        }


        public static string JSToCSMobile(string dateFormat)
        {
            string newFormat = dateFormat;
            if (dateFormat != null)
            {
                if (newFormat.Contains("%y"))
                {
                    newFormat = newFormat.Replace("%y", "yyy");
                }
                else if (newFormat.Contains("%Y"))
                {
                    newFormat = newFormat.Replace("%Y", "yyyy");
                }


                if (newFormat.Contains("%B"))
                {
                    newFormat = newFormat.Replace("%B", "MMMM");
                }
                else if (newFormat.Contains("%b"))
                {
                    newFormat = newFormat.Replace("%b", "MMM");
                }
                else if (newFormat.Contains("%m"))
                {
                    newFormat = newFormat.Replace("%m", "MM");
                }
                else if (newFormat.Contains("%m"))
                {
                    newFormat = newFormat.Replace("%m", "M");
                }

                if (newFormat.Contains("%A"))
                {
                    newFormat = newFormat.Replace("%A", "dddd");
                }
                else if (newFormat.Contains("%a"))
                {
                    newFormat = newFormat.Replace("%a", "ddd");
                }
                else if (newFormat.Contains("%d"))
                {
                    newFormat = newFormat.Replace("%d", "dd");
                }
                else if (newFormat.Contains("%d"))
                {
                    newFormat = newFormat.Replace("%d", "d");
                }


                //Hour
                if (newFormat.Contains("%I"))
                {
                    newFormat = newFormat.Replace("%I", "hh");
                }
                else if (newFormat.Contains("%I"))
                {
                    newFormat = newFormat.Replace("%I", "h");
                }
                else if (newFormat.Contains("%H"))
                {
                    newFormat = newFormat.Replace("%H", "HH");
                }
                else if (newFormat.Contains("%H"))
                {
                    newFormat = newFormat.Replace("%H", "H");
                }


                //Minute
                if (newFormat.Contains("%M"))
                {
                    newFormat = newFormat.Replace("%M", "mm");
                }
                else if (newFormat.Contains("%M"))
                {
                    newFormat = newFormat.Replace("%M", "m");
                }



                //Second
                if (newFormat.Contains("%S"))
                {
                    newFormat = newFormat.Replace("%S", "ss");
                }
                else if (newFormat.Contains("%S"))
                {
                    newFormat = newFormat.Replace("%S", "s");
                }


                //AM/PM
                if (newFormat.Contains("%p"))
                {
                    newFormat = newFormat.Replace("%p", "tt");
                }
                else if (newFormat.Contains("%p"))
                {
                    newFormat = newFormat.Replace("%p", "t");
                }
            }
            return newFormat;
        }


        public static string GetDateFieldOrder(string format)
        {
            var returnFormat = "[\"d\", \"m\", \"y\"]"; 
            if (!String.IsNullOrEmpty(format))
            {
                if (format.IndexOf('d') > format.IndexOf('M'))
                {
                    returnFormat = "[\"m\", \"d\", \"y\"]";
                }
            }
            return returnFormat;
        }


    }
}
