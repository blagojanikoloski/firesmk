using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
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

        public MapController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _openWeatherMapApiKey = configuration.GetValue<string>("OpenWeatherMapApiKey");
            _httpClient = httpClientFactory.CreateClient();
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
    }
}
