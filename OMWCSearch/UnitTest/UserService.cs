using OMWCSearch.Interfaces;

namespace OMWCSearch.UnitTest
{
    public class UserService : IUserService
    {

        /// <summary>
        /// Determines if user with <paramref name="userName"/> and password <paramref name="password"/> exists in the database
        /// </summary>
        /// <param name="userName"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public bool ValildateUser(string userName, string password)
        {
            return true;
        }
   }
}