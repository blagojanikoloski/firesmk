using FiresMk.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FiresMk.Server.Data
{
    public class FiresMkContext : DbContext
    {
        public FiresMkContext(DbContextOptions<FiresMkContext> options) : base(options)
        {
        }

        public DbSet<Fire> Fires { get; set; }

        public DbSet<DataFetch> DataFetches { get; set; }
    }
}
