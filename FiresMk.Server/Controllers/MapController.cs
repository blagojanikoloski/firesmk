using FiresMk.Server.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace FiresMk.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MapController : ControllerBase
    {
        private readonly string _openWeatherMapApiKey;
        private readonly HttpClient _httpClient;
        private readonly FiresMkContext _context;
        public MapController(IConfiguration configuration, IHttpClientFactory httpClientFactory, FiresMkContext context)
        {
            _openWeatherMapApiKey = configuration.GetValue<string>("OpenWeatherMapApiKey");
            _httpClient = httpClientFactory.CreateClient();
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        [HttpGet("weather")]
        public async Task<IActionResult> GetWeather(double latitude, double longitude)
        {
            try
            {
                var apiUrl = $"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={_openWeatherMapApiKey}";

                var response = await _httpClient.GetAsync(apiUrl);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Ok(content);
                }
                else
                {
                    return StatusCode((int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, $"Failed to retrieve weather data: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("firesForDate")]
        public IActionResult GetFiresForDate(string date)
        {
            if (!DateTime.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
            {
                return BadRequest("Invalid date format. Please provide date in yyyy-MM-dd format.");
            }

            var fires = _context.Fires.Where(f => f.Datetime.Date == parsedDate.Date);
            return Ok(fires);
        }

    }
}
