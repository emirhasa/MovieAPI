using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Software_Assignment.Models
{
    public class UserQuery
    {
        public int UserQueryId { get; set; }
        public string Query { get; set; }
        public DateTime Time { get; set; }
    }
}
