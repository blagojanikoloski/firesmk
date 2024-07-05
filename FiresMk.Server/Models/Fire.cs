using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;

namespace FiresMk.Server.Models
{
    public class Fire
    {
        [Key]
        public int Id { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Temperature { get; set; }
        public DateTime Datetime { get; set; }
    }
}
