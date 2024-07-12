using System.ComponentModel.DataAnnotations;

namespace FiresMk.Server.Models
{
    public class DataFetch
    {
        [Key]
        public int Id { get; set; }
        public DateTime LastFireDataFetch { get; set; }
    }
}
