using Microsoft.AspNetCore.Mvc;
using System;
using System.Diagnostics;
using FiresMk.Server.Data;
using Microsoft.EntityFrameworkCore;
using FiresMk.Server.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;


namespace FiresMk.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : Controller
    {
        private readonly string _nasaApiKey;
        private readonly FiresMkContext _context;
        public HomeController(IConfiguration configuration, FiresMkContext context)
        {
            _nasaApiKey = configuration.GetValue<string>("NasaApiKey");
            _context = context;
        }

        [HttpGet("latestDataFetch")]
        public async Task<ActionResult<DataFetch>> GetLatestDataFetch()
        {
            var latestDataFetch = await _context.DataFetches
                .OrderByDescending(df => df.LastFireDataFetch)
                .FirstOrDefaultAsync();

            if (latestDataFetch == null)
            {
                return NotFound();
            }

            return latestDataFetch;
        }

        [HttpGet("run-python-script")]
        public IActionResult RunPythonScriptManually()
        {
            string scriptPath = "Scripts/get_latest_fires.py";

            try
            {
                ProcessStartInfo startInfo = new ProcessStartInfo()
                {
                    FileName = "python3",
                    Arguments = $"{scriptPath} {_nasaApiKey}",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (Process process = Process.Start(startInfo))
                {
                    using (var reader = process.StandardOutput)
                    {
                        string result = reader.ReadToEnd();

                        // Deserialize JSON array into a list of Fire objects
                        List<Fire> fires = JsonConvert.DeserializeObject<List<Fire>>(result);

                        // Process each fire object
                        foreach (var fire in fires)
                        {
                            // Check if a similar fire entry already exists in the database
                            var existingFire = _context.Fires.FirstOrDefault(f =>
                                f.Latitude == fire.Latitude &&
                                f.Longitude == fire.Longitude &&
                                f.Temperature == fire.Temperature &&
                                f.Datetime == fire.Datetime);

                            if (existingFire == null)
                            {
                                // If no existing entry found, add the fire to the database
                                _context.Fires.Add(fire);
                            }
                            // Optionally, you could log or handle duplicate entries here
                        }

                        var dataFetch = new DataFetch
                        {
                            LastFireDataFetch = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time"))
                        };

                        _context.DataFetches.Add(dataFetch);

                        // Save changes to the database
                        _context.SaveChanges();

                        return Ok("Fire data processed successfully.");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error executing Python script: {ex.Message}");
            }
        }


        [HttpGet("numberOfFiresToday")]
        public IActionResult GetNumberOfFiresToday()
        {
            var today = DateTime.Now.Date;
            int firesToday = _context.Fires.Count(f => f.Datetime.Date == today);
            return Ok(firesToday);
        }
    }
}
