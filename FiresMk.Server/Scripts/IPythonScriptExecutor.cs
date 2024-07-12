using FiresMk.Server.Data;
using FiresMk.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace FiresMk.Server.Services
{
    public interface IPythonScriptExecutor
    {
        Task RunScriptAsync();
    }

    public class PythonScriptExecutor : IPythonScriptExecutor
    {
        private readonly string _nasaApiKey;
        private readonly FiresMkContext _context;
        private readonly ILogger<PythonScriptExecutor> _logger;

        public PythonScriptExecutor(IConfiguration configuration, FiresMkContext context, ILogger<PythonScriptExecutor> logger)
        {
            _nasaApiKey = configuration.GetValue<string>("NasaApiKey");
            _context = context;
            _logger = logger;
        }

        public async Task RunScriptAsync()
        {
            string scriptPath = "Scripts/get_latest_fires.py";

            try
            {
                ProcessStartInfo startInfo = new ProcessStartInfo()
                {
                    FileName = "python",
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
                            LastFireDataFetch = DateTime.Now
                        };

                        _context.DataFetches.Add(dataFetch);

                        // Save changes to the database
                        _context.SaveChanges();

                        _logger.LogInformation("Fire data processed successfully.");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation(500, $"Error executing Python script: {ex.Message}");
            }
        }
    }
}
